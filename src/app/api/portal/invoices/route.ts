import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(['CUSTOMER'], async (req, { user }) => {
  const invoices = await prisma.invoice.findMany({
    where: { customerId: user.userId },
    include: {
      subscription: {
        select: {
          number: true,
          plan: { select: { name: true } },
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

  const now = new Date();
  const enriched = invoices.map((inv) => ({
    ...inv,
    isOverdue: inv.status !== 'PAID' && new Date(inv.dueDate) < now,
    remainingCents: Math.max(0, inv.totalCents - inv.paidCents),
  }));

  return NextResponse.json({ invoices: enriched });
});
