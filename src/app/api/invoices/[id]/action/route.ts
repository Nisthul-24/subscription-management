import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { validateInvoiceTransition } from '@/lib/status-machine';
import { invoiceActionSchema } from '@/lib/validators/subscription.schema';
import { sendEmail, invoiceEmail } from '@/lib/email';
import { formatMoney } from '@/lib/money';
import { format } from 'date-fns';
import type { InvoiceStatus } from '@/lib/types';

export const POST = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = invoiceActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { action, reason } = result.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (action === 'send') {
      const emailContent = invoiceEmail(
        invoice.customer.firstName,
        invoice.number,
        formatMoney(invoice.totalCents),
        format(invoice.dueDate, 'MMM dd, yyyy')
      );

      await sendEmail({
        ...emailContent,
        to: invoice.customer.email,
      });

      // If invoice was DRAFT, auto-confirm on send
      if (invoice.status === 'DRAFT') {
        await prisma.invoice.update({
          where: { id },
          data: { status: 'CONFIRMED' },
        });

        await prisma.statusLog.create({
          data: {
            entityType: 'INVOICE',
            entityId: id,
            fromStatus: 'DRAFT',
            toStatus: 'CONFIRMED',
            changedById: user.userId,
            reason: 'Auto-confirmed upon sending to customer',
          },
        });
      }

      return NextResponse.json({ message: `Invoice ${invoice.number} sent to ${invoice.customer.email}` });
    }

    const validation = validateInvoiceTransition(invoice.status as InvoiceStatus, action);
    if (!validation.valid || !validation.nextStatus) {
      return NextResponse.json(
        { error: validation.error || `Invalid action '${action}' for status '${invoice.status}'` },
        { status: 400 }
      );
    }

    const nextStatus = validation.nextStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: { status: nextStatus },
      });

      await tx.statusLog.create({
        data: {
          entityType: 'INVOICE',
          entityId: id,
          fromStatus: invoice.status,
          toStatus: nextStatus,
          changedById: user.userId,
          reason: reason || `Invoice ${action}ed`,
        },
      });

      return inv;
    });

    return NextResponse.json({ invoice: updated, message: `Invoice status changed to ${nextStatus}` });
  } catch (error) {
    console.error('Invoice action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
