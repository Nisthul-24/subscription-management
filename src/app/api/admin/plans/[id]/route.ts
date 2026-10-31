import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { updatePlanSchema } from '@/lib/validators/plan.schema';

export const PUT = withAuth(['ADMIN'], async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = updatePlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...result.data };
    if (result.data.availableFrom !== undefined) {
      updateData.availableFrom = result.data.availableFrom ? new Date(result.data.availableFrom) : null;
    }
    if (result.data.availableTo !== undefined) {
      updateData.availableTo = result.data.availableTo ? new Date(result.data.availableTo) : null;
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withAuth(['ADMIN'], async (req, { params }) => {
  try {
    const { id } = await params;
    const plan = await prisma.plan.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ plan, message: 'Plan deactivated' });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
