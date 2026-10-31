import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createPaymentSchema } from '@/lib/validators/subscription.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest) => {
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get('invoiceId');

  const where = invoiceId ? { invoiceId } : {};

  const payments = await prisma.payment.findMany({
    where,
    include: {
      invoice: {
        select: {
          number: true,
          totalCents: true,
          paidCents: true,
          customer: { select: { firstName: true, lastName: true, company: true } },
        },
      },
      recordedBy: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { paymentDate: 'desc' },
  });

  return NextResponse.json({ payments });
});

export const POST = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const result = createPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { invoiceId, method, amountCents, paymentDate, note } = result.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot record payment on a cancelled invoice' }, { status: 400 });
    }

    const remainingCents = invoice.totalCents - invoice.paidCents;
    if (amountCents > remainingCents) {
      return NextResponse.json(
        { error: `Payment amount ($${(amountCents / 100).toFixed(2)}) exceeds outstanding balance ($${(remainingCents / 100).toFixed(2)})` },
        { status: 400 }
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          invoiceId,
          method,
          amountCents,
          paymentDate: new Date(paymentDate),
          note: note || null,
          recordedById: user.userId,
        },
      });

      const newPaidCents = invoice.paidCents + amountCents;
      const willBePaid = newPaidCents >= invoice.totalCents;

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidCents: newPaidCents,
          status: willBePaid ? 'PAID' : (invoice.status === 'DRAFT' ? 'CONFIRMED' : invoice.status),
        },
      });

      if (willBePaid && invoice.status !== 'PAID') {
        await tx.statusLog.create({
          data: {
            entityType: 'INVOICE',
            entityId: invoiceId,
            fromStatus: invoice.status,
            toStatus: 'PAID',
            changedById: user.userId,
            reason: `Invoice fully paid via ${method}`,
          },
        });
      }

      return createdPayment;
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Payment record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
