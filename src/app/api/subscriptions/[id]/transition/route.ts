import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { validateSubscriptionTransition } from '@/lib/status-machine';
import { transitionSubscriptionSchema } from '@/lib/validators/subscription.schema';
import type { SubscriptionStatus } from '@/lib/types';

export const POST = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = transitionSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { action, reason } = result.data;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const validation = validateSubscriptionTransition(
      subscription.status as SubscriptionStatus,
      action,
      {
        pausable: subscription.plan.pausable,
        closableEarly: subscription.plan.closableEarly,
      }
    );

    if (!validation.valid || !validation.nextStatus) {
      return NextResponse.json(
        { error: validation.error || `Invalid action '${action}' for status '${subscription.status}'` },
        { status: 400 }
      );
    }

    const nextStatus = validation.nextStatus;

    // Transactionally update status and append to audit log
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: { status: nextStatus },
        include: {
          customer: true,
          plan: true,
          lines: {
            include: { product: true, variant: true },
          },
        },
      });

      await tx.statusLog.create({
        data: {
          entityType: 'SUBSCRIPTION',
          entityId: id,
          fromStatus: subscription.status,
          toStatus: nextStatus,
          changedById: user.userId,
          reason: reason || `Transitioned via ${action}`,
        },
      });

      return sub;
    });

    return NextResponse.json({
      subscription: updated,
      message: `Status successfully changed from ${subscription.status} to ${nextStatus}`,
    });
  } catch (error) {
    console.error('Transition subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
