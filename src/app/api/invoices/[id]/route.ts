import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req, { params }) => {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      subscription: {
        include: { plan: true },
      },
      lines: {
        include: {
          product: true,
          variant: true,
          taxRule: true,
          discountRule: true,
        },
      },
      payments: {
        include: {
          recordedBy: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const now = new Date();
  const enriched = {
    ...invoice,
    isOverdue: invoice.status !== 'PAID' && new Date(invoice.dueDate) < now,
    remainingCents: Math.max(0, invoice.totalCents - invoice.paidCents),
  };

  return NextResponse.json({ invoice: enriched });
});
