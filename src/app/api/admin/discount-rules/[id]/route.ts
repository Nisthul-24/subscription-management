import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { updateDiscountRuleSchema } from '@/lib/validators/tax-discount.schema';

export const PUT = withAuth(['ADMIN'], async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateDiscountRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { productIds, ...data } = result.data;
    const updateData: Record<string, unknown> = { ...data };

    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const discountRule = await prisma.discountRule.update({
      where: { id },
      data: updateData,
    });

    if (productIds !== undefined) {
      // Refresh relations
      await prisma.discountRuleProduct.deleteMany({ where: { discountRuleId: id } });
      if (productIds.length > 0) {
        await prisma.discountRuleProduct.createMany({
          data: productIds.map((productId) => ({ discountRuleId: id, productId })),
        });
      }
    }

    return NextResponse.json({ discountRule });
  } catch (error) {
    console.error('Update discount rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withAuth(['ADMIN'], async (req, { params }) => {
  try {
    const { id } = await params;
    const discountRule = await prisma.discountRule.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ discountRule, message: 'Discount rule deactivated' });
  } catch (error) {
    console.error('Delete discount rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
