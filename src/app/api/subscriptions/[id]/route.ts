import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req, { params }) => {
  const { id } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: true,
      plan: true,
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
      invoices: {
        orderBy: { invoiceDate: 'desc' },
        include: {
          payments: true,
        },
      },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  const statusLogs = await prisma.statusLog.findMany({
    where: {
      entityType: 'SUBSCRIPTION',
      entityId: id,
    },
    include: {
      changedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { changedAt: 'desc' },
  });

  return NextResponse.json({ subscription, statusLogs });
});
