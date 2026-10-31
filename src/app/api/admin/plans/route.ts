import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createPlanSchema } from '@/lib/validators/plan.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async () => {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
  });

  return NextResponse.json({ plans });
});

export const POST = withAuth(['ADMIN'], async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = createPlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        ...result.data,
        availableFrom: result.data.availableFrom ? new Date(result.data.availableFrom) : null,
        availableTo: result.data.availableTo ? new Date(result.data.availableTo) : null,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
