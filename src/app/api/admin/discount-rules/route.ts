import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createDiscountRuleSchema } from '@/lib/validators/tax-discount.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async () => {
  const discountRules = await prisma.discountRule.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json({ discountRules });
});

export const POST = withAuth(['ADMIN'], async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = createDiscountRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { productIds, ...data } = result.data;

    const discountRule = await prisma.discountRule.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        products: productIds?.length
          ? {
              create: productIds.map((productId) => ({ productId })),
            }
          : undefined,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ discountRule }, { status: 201 });
  } catch (error) {
    console.error('Create discount rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
