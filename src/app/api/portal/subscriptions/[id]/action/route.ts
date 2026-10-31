import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { validateSubscriptionTransition } from '@/lib/status-machine';
import { z } from 'zod';
import type { SubscriptionStatus } from '@/lib/types';

const portalActionSchema = z.object({
  action: z.enum(['pause', 'resume', 'close']),
});

export const POST = withAuth(['CUSTOMER'], async (req: NextRequest, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = portalActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { action } = result.data;

    // Strict ownership verification
    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        customerId: user.userId,
      },
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
        { error: validation.error || `Action '${action}' is not permitted for your subscription plan` },
        { status: 400 }
      );
    }

    const nextStatus = validation.nextStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: { status: nextStatus },
      });

      await tx.statusLog.create({
        data: {
          entityType: 'SUBSCRIPTION',
          entityId: id,
          fromStatus: subscription.status,
          toStatus: nextStatus,
          changedById: user.userId,
          reason: `Customer requested ${action}`,
        },
      });

      return sub;
    });

    return NextResponse.json({
      subscription: updated,
      message: `Subscription has been ${nextStatus.toLowerCase()}`,
    });
  } catch (error) {
    console.error('Portal subscription action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
