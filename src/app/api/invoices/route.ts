import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const customerId = url.searchParams.get('customerId');
  const overdueOnly = url.searchParams.get('overdue') === 'true';
  const search = url.searchParams.get('search');

  const now = new Date();
  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (overdueOnly) {
    where.status = { not: 'PAID' };
    where.dueDate = { lt: now };
  }
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { customer: { company: { contains: search, mode: 'insensitive' } } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          company: true,
          email: true,
        },
      },
      subscription: {
        select: {
          number: true,
          plan: { select: { name: true, billingPeriod: true } },
        },
      },
      payments: {
        select: {
          id: true,
          amountCents: true,
          paymentDate: true,
          method: true,
        },
      },
    },
    orderBy: { invoiceDate: 'desc' },
  });

  const enrichedInvoices = invoices.map((inv) => ({
    ...inv,
    isOverdue: inv.status !== 'PAID' && new Date(inv.dueDate) < now,
    remainingCents: Math.max(0, inv.totalCents - inv.paidCents),
  }));

  return NextResponse.json({ invoices: enrichedInvoices });
});
