import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(['CUSTOMER'], async (req, { user }) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { customerId: user.userId },
    include: {
      plan: true,
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
      invoices: {
        select: {
          id: true,
          number: true,
          status: true,
          totalCents: true,
          paidCents: true,
          dueDate: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ subscriptions });
});
