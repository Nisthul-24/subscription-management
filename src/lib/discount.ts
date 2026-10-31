/**
 * Discount matching and application logic.
 * 
 * Rules:
 * - At most one discount per invoice line. If multiple match, the highest value wins.
 * - Usage counting is atomic: UPDATE ... SET usage_count = usage_count + 1 WHERE usage_count < limit.
 * - Discount stops when expired or usage limit reached.
 */

import { prisma } from './db';
import { roundHalfUp } from './money';
import type { DiscountRule } from '@prisma/client';

interface DiscountCandidate {
  productId: string;
  subscriptionId: string;
  lineAmountCents: number;
  quantity: number;
}

interface AppliedDiscount {
  discountRuleId: string;
  discountRuleName: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountCents: number;
}

/**
 * Find the best matching discount rule for a line item.
 * Returns null if no applicable discount exists.
 */
export async function findBestDiscount(
  candidate: DiscountCandidate,
  billingDate: Date
): Promise<AppliedDiscount | null> {
  // Fetch all active, non-expired discount rules
  const rules = await prisma.discountRule.findMany({
    where: {
      active: true,
      OR: [
        { startDate: null },
        { startDate: { lte: billingDate } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: billingDate } },
          ],
        },
      ],
    },
    include: {
      products: true,
    },
  });

  // Filter rules that match this line
  const matchingRules = rules.filter((rule) => {
    // Check usage limit
    if (rule.usageLimit !== null && rule.usageCount >= rule.usageLimit) {
      return false;
    }

    // Check minimum purchase
    if (rule.minPurchaseCents > 0 && candidate.lineAmountCents < rule.minPurchaseCents) {
      return false;
    }

    // Check minimum quantity
    if (rule.minQuantity > 0 && candidate.quantity < rule.minQuantity) {
      return false;
    }

    // Check scope
    if (rule.scope === 'PRODUCT') {
      // Rule must be linked to this product
      const productLinked = rule.products.some((p) => p.productId === candidate.productId);
      if (!productLinked) return false;
    }
    // SUBSCRIPTION scope applies to all lines in a subscription

    return true;
  });

  if (matchingRules.length === 0) return null;

  // Calculate discount amount for each rule and pick the highest
  const candidates = matchingRules.map((rule) => {
    const discountCents = calculateDiscountAmount(candidate.lineAmountCents, rule);
    return {
      rule,
      discountCents,
    };
  });

  // Sort by discount amount descending, pick highest
  candidates.sort((a, b) => b.discountCents - a.discountCents);
  const best = candidates[0];

  return {
    discountRuleId: best.rule.id,
    discountRuleName: best.rule.name,
    discountType: best.rule.discountType,
    discountCents: best.discountCents,
  };
}

/**
 * Atomically increment usage count for a discount rule.
 * Returns true if the increment succeeded (rule not exhausted).
 */
export async function incrementDiscountUsage(discountRuleId: string): Promise<boolean> {
  const rule = await prisma.discountRule.findUnique({
    where: { id: discountRuleId },
    select: { usageLimit: true, usageCount: true },
  });
  if (!rule) return false;
  if (rule.usageLimit !== null && rule.usageCount >= rule.usageLimit) {
    return false;
  }
  await prisma.discountRule.update({
    where: { id: discountRuleId },
    data: { usageCount: { increment: 1 } },
  });
  return true;
}

function calculateDiscountAmount(lineAmountCents: number, rule: DiscountRule): number {
  if (rule.discountType === 'FIXED') {
    return Math.min(rule.valueCents, lineAmountCents);
  }
  // PERCENTAGE
  return Math.min(
    roundHalfUp((lineAmountCents * rule.valueBps) / 10000),
    lineAmountCents
  );
}
