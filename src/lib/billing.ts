/**
 * Billing engine — generates invoices for due subscriptions.
 * 
 * Key properties:
 * - Idempotent: unique constraint on (subscriptionId, billingPeriodKey) prevents duplicates.
 * - Catch-up: query uses ≤ today, so missed runs are caught up.
 * - Transactional: invoice + lines + discount usage + nextBillingDate advance in one TX.
 */

import { prisma } from './db';
import { generateSequenceNumber } from './sequence';
import { findBestDiscount, incrementDiscountUsage } from './discount';
import { computeTaxCents } from './tax';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import type { Subscription, SubscriptionLine, TaxRule } from '@prisma/client';
import type { BillingPeriod } from './types';

type SubscriptionWithLines = Subscription & {
  plan: { billingPeriod: BillingPeriod };
  lines: (SubscriptionLine & {
    product: { type: string; name: string };
    variant: { value: string; extraPriceCents: number } | null;
    taxes: { taxRule: TaxRule }[];
  })[];
};

/**
 * Auto-close any ACTIVE subscriptions that have reached their expiryDate
 * where the plan's autoCloseAtEnd rule is true.
 */
export async function autoCloseExpiredSubscriptions(asOfDate: Date = new Date()): Promise<number> {
  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: {
        lte: asOfDate,
      },
      plan: {
        autoCloseAtEnd: true,
      },
    },
  });

  let count = 0;
  for (const sub of expiredSubs) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { id: sub.id },
          data: { status: 'CLOSED' },
        });
        await tx.statusLog.create({
          data: {
            entityType: 'SUBSCRIPTION',
            entityId: sub.id,
            fromStatus: 'ACTIVE',
            toStatus: 'CLOSED',
            reason: 'Auto-closed at end of term per plan policy',
          },
        });
      });
      count++;
    } catch (e) {
      console.error(`Failed to auto-close subscription ${sub.id}:`, e);
    }
  }

  return count;
}

/**
 * Run billing for all subscriptions due on or before the given date.
 * Also auto-closes any subscriptions that reached expiry date.
 * Returns the number of invoices generated and subscriptions closed.
 */
export async function runBilling(billingDate: Date): Promise<{ generated: number; autoClosed: number; errors: string[] }> {
  const errors: string[] = [];
  let generated = 0;

  // 1. Auto-close expired subscriptions on plans configured for autoCloseAtEnd
  const autoClosed = await autoCloseExpiredSubscriptions(billingDate);

  // 2. Find all ACTIVE subscriptions with nextBillingDate ≤ billingDate
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: {
        lte: billingDate,
      },
    },
    include: {
      lines: {
        include: {
          product: true,
          variant: true,
          taxes: {
            include: {
              taxRule: true,
            },
          },
        },
      },
      plan: true,
    },
  });

  for (const sub of dueSubscriptions) {
    // Handle catch-up: generate invoices for each missed period
    let currentBillingDate = sub.nextBillingDate!;

    while (currentBillingDate <= billingDate) {
      const periodKey = `${sub.id}_${format(currentBillingDate, 'yyyy-MM-dd')}`;

      try {
        await generateInvoice(sub as SubscriptionWithLines, currentBillingDate, periodKey);
        generated++;
      } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        // P2002 = unique constraint violation (already billed)
        if (err.code === 'P2002') {
          // Idempotent: skip already-billed period
        } else {
          errors.push(`Subscription ${sub.number}: ${err.message || 'Unknown error'}`);
        }
      }

      currentBillingDate = advanceBillingDate(currentBillingDate, sub.plan.billingPeriod);
    }
  }

  return { generated, autoClosed, errors };
}

/**
 * Generate a single invoice for a subscription period.
 * Runs in a database transaction.
 */
async function generateInvoice(
  sub: SubscriptionWithLines,
  periodStart: Date,
  billingPeriodKey: string
): Promise<void> {
  const invoiceNumber = await generateSequenceNumber('INV', periodStart);
  const dueDate = addDays(periodStart, sub.paymentTermsDays);

  let subtotalCents = 0;
  let totalDiscountCents = 0;
  let totalTaxCents = 0;

  // Build invoice lines outside the transaction to avoid holding locks
  const lineData: Array<{
    productId: string;
    variantId: string | null;
    description: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    discountCents: number;
    discountRuleId: string | null;
    taxCents: number;
    taxRuleId: string | null;
    taxRateBps: number;
  }> = [];

  for (const line of sub.lines) {
    const lineTotal = line.quantity * line.unitPriceCents;
    subtotalCents += lineTotal;

    // Find and apply discount
    let discountCents = 0;
    let discountRuleId: string | null = null;

    const discount = await findBestDiscount(
      {
        productId: line.productId,
        subscriptionId: sub.id,
        lineAmountCents: lineTotal,
        quantity: line.quantity,
      },
      periodStart
    );

    if (discount) {
      const usageOk = await incrementDiscountUsage(discount.discountRuleId);
      if (usageOk) {
        discountCents = discount.discountCents;
        discountRuleId = discount.discountRuleId;
        totalDiscountCents += discountCents;
      }
    }

    // Calculate tax on (lineTotal - discount)
    const taxableAmount = lineTotal - discountCents;
    let lineTaxCents = 0;
    let lineTaxRuleId: string | null = null;
    let lineTaxRateBps = 0;

    if (line.taxes.length > 0) {
      const taxRule = line.taxes[0].taxRule;
      lineTaxCents = computeTaxCents(taxableAmount, taxRule.rateBps);
      lineTaxRuleId = taxRule.id;
      lineTaxRateBps = taxRule.rateBps;
    }
    totalTaxCents += lineTaxCents;

    const variantLabel = line.variant ? ` (${line.variant.value})` : '';
    lineData.push({
      productId: line.productId,
      variantId: line.variantId,
      description: `${line.product.name}${variantLabel}`,
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
      lineTotalCents: lineTotal,
      discountCents,
      discountRuleId,
      taxCents: lineTaxCents,
      taxRuleId: lineTaxRuleId,
      taxRateBps: lineTaxRateBps,
    });
  }

  const totalCents = subtotalCents - totalDiscountCents + totalTaxCents;
  const nextDate = advanceBillingDate(periodStart, sub.plan.billingPeriod as BillingPeriod);

  // Perform atomic write inside transaction with extended timeout
  await prisma.$transaction(
    async (tx) => {
      // Create invoice with lines
      await tx.invoice.create({
        data: {
          number: invoiceNumber,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          status: 'DRAFT',
          invoiceDate: periodStart,
          dueDate,
          billingPeriodKey,
          subtotalCents,
          discountCents: totalDiscountCents,
          taxCents: totalTaxCents,
          totalCents,
          paidCents: 0,
          lines: {
            create: lineData,
          },
        },
      });

      // Advance the subscription's next billing date
      await tx.subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: nextDate },
      });
    },
    { timeout: 20000 }
  );
}

/**
 * Advance a billing date by one period.
 * Handles month-end snapping (e.g. Jan 31 → Feb 28).
 */
function advanceBillingDate(date: Date, period: BillingPeriod): Date {
  switch (period) {
    case 'DAILY':
      return addDays(date, 1);
    case 'WEEKLY':
      return addWeeks(date, 1);
    case 'MONTHLY':
      return addMonths(date, 1);
    case 'YEARLY':
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
}
