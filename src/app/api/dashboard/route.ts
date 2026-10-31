import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const GET = withAuth(['ADMIN', 'STAFF'], async () => {
  const now = new Date();

  // 1. Active Subscriptions Count
  const activeSubsCount = await prisma.subscription.count({
    where: { status: 'ACTIVE' },
  });

  // 2. Active subscriptions lines for MRR calculation
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: {
      plan: true,
      lines: true,
    },
  });

  let mrrCents = 0;
  for (const sub of activeSubscriptions) {
    const subTotal = sub.lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
    switch (sub.plan.billingPeriod) {
      case 'DAILY':
        mrrCents += subTotal * 30;
        break;
      case 'WEEKLY':
        mrrCents += Math.round(subTotal * 4.3333);
        break;
      case 'MONTHLY':
        mrrCents += subTotal;
        break;
      case 'YEARLY':
        mrrCents += Math.round(subTotal / 12);
        break;
      default:
        mrrCents += subTotal;
    }
  }

  // 3. Total Revenue Received (sum of payments)
  const paymentsAgg = await prisma.payment.aggregate({
    _sum: { amountCents: true },
    _count: true,
  });
  const totalRevenueCents = paymentsAgg._sum.amountCents || 0;

  // 4. Outstanding and Overdue
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      status: { notIn: ['PAID', 'CANCELLED'] },
    },
    select: {
      totalCents: true,
      paidCents: true,
      dueDate: true,
    },
  });

  let outstandingCents = 0;
  let overdueCount = 0;
  for (const inv of unpaidInvoices) {
    outstandingCents += Math.max(0, inv.totalCents - inv.paidCents);
    if (new Date(inv.dueDate) < now) {
      overdueCount++;
    }
  }

  // 5. Monthly Revenue Trend (Last 6 Months)
  const monthlyRevenue: Array<{ month: string; revenue: number; invoicesCount: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = subMonths(now, i);
    const mStart = startOfMonth(targetDate);
    const mEnd = endOfMonth(targetDate);

    const mPayment = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: mStart,
          lte: mEnd,
        },
      },
      _sum: { amountCents: true },
    });

    const mInvoicesCount = await prisma.invoice.count({
      where: {
        invoiceDate: {
          gte: mStart,
          lte: mEnd,
        },
      },
    });

    monthlyRevenue.push({
      month: format(targetDate, 'MMM yyyy'),
      revenue: (mPayment._sum.amountCents || 0) / 100,
      invoicesCount: mInvoicesCount,
    });
  }

  // 6. Payment Methods Distribution
  const paymentsByMethod = await prisma.payment.groupBy({
    by: ['method'],
    _sum: { amountCents: true },
    _count: true,
  });

  const paymentMethods = paymentsByMethod.map((p) => ({
    method: p.method.replace('_', ' '),
    total: (p._sum.amountCents || 0) / 100,
    count: p._count,
  }));

  // 7. Recent Invoices
  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        select: { firstName: true, lastName: true, company: true },
      },
    },
  });

  // 8. Recent Subscriptions
  const recentSubscriptions = await prisma.subscription.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        select: { firstName: true, lastName: true, company: true },
      },
      plan: true,
    },
  });

  return NextResponse.json({
    kpis: {
      activeSubsCount,
      mrrCents,
      totalRevenueCents,
      outstandingCents,
      overdueCount,
    },
    monthlyRevenue,
    paymentMethods,
    recentInvoices,
    recentSubscriptions,
  });
});
