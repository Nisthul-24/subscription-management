import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { generateSequenceNumber } from '@/lib/sequence';
import { createSubscriptionSchema } from '@/lib/validators/subscription.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const customerId = url.searchParams.get('customerId');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { customer: { company: { contains: search, mode: 'insensitive' } } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const subscriptions = await prisma.subscription.findMany({
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
      _count: {
        select: { invoices: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ subscriptions });
});

export const POST = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const result = createSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { customerId, planId, startDate, expiryDate, paymentTermsDays, notes, lines } = result.data;

    const start = new Date(startDate);
    const subNumber = await generateSequenceNumber('SUB', start);

    const subscription = await prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          number: subNumber,
          customerId,
          planId,
          status: 'DRAFT',
          startDate: start,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          paymentTermsDays,
          nextBillingDate: start,
          notes: notes || null,
          lines: {
            create: lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId || null,
              quantity: line.quantity,
              unitPriceCents: line.unitPriceCents,
              taxes: line.taxRuleIds?.length
                ? {
                    create: line.taxRuleIds.map((taxRuleId) => ({ taxRuleId })),
                  }
                : undefined,
            })),
          },
        },
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
        },
      });

      // Audit log
      await tx.statusLog.create({
        data: {
          entityType: 'SUBSCRIPTION',
          entityId: created.id,
          fromStatus: 'NONE',
          toStatus: 'DRAFT',
          changedById: user.userId,
          reason: 'Subscription created',
        },
      });

      return created;
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
