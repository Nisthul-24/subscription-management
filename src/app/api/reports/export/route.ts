import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { format } from 'date-fns';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest) => {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'invoices';

  let csvContent = '';
  let filename = '';

  if (type === 'invoices') {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        subscription: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });

    const header = ['Invoice Number', 'Customer', 'Email', 'Subscription', 'Date', 'Due Date', 'Status', 'Subtotal', 'Discounts', 'Taxes', 'Total', 'Paid', 'Balance'];
    const rows = invoices.map((inv) => [
      inv.number,
      `"${inv.customer.company || `${inv.customer.firstName} ${inv.customer.lastName}`}"`,
      inv.customer.email,
      inv.subscription.number,
      format(inv.invoiceDate, 'yyyy-MM-dd'),
      format(inv.dueDate, 'yyyy-MM-dd'),
      inv.status,
      (inv.subtotalCents / 100).toFixed(2),
      (inv.discountCents / 100).toFixed(2),
      (inv.taxCents / 100).toFixed(2),
      (inv.totalCents / 100).toFixed(2),
      (inv.paidCents / 100).toFixed(2),
      ((inv.totalCents - inv.paidCents) / 100).toFixed(2),
    ]);

    csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    filename = `invoices-export-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  } else if (type === 'subscriptions') {
    const subs = await prisma.subscription.findMany({
      include: {
        customer: true,
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = ['Subscription Number', 'Customer', 'Email', 'Plan', 'Billing Period', 'Status', 'Start Date', 'Next Billing Date', 'Expiry Date'];
    const rows = subs.map((s) => [
      s.number,
      `"${s.customer.company || `${s.customer.firstName} ${s.customer.lastName}`}"`,
      s.customer.email,
      `"${s.plan.name}"`,
      s.plan.billingPeriod,
      s.status,
      format(s.startDate, 'yyyy-MM-dd'),
      s.nextBillingDate ? format(s.nextBillingDate, 'yyyy-MM-dd') : '',
      s.expiryDate ? format(s.expiryDate, 'yyyy-MM-dd') : '',
    ]);

    csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    filename = `subscriptions-export-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  } else {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: { include: { customer: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const header = ['Payment ID', 'Invoice Number', 'Customer', 'Amount', 'Method', 'Date', 'Note'];
    const rows = payments.map((p) => [
      p.id,
      p.invoice.number,
      `"${p.invoice.customer.company || `${p.invoice.customer.firstName} ${p.invoice.customer.lastName}`}"`,
      (p.amountCents / 100).toFixed(2),
      p.method,
      format(p.paymentDate, 'yyyy-MM-dd'),
      `"${p.note || ''}"`,
    ]);

    csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    filename = `payments-export-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  }

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
});
