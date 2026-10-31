import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createQuotationTemplateSchema } from '@/lib/validators/subscription.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async () => {
  const templates = await prisma.quotationTemplate.findMany({
    where: { active: true },
    include: {
      plan: true,
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ templates });
});

export const POST = withAuth(['ADMIN', 'STAFF'], async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = createQuotationTemplateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, planId, validDays, lines } = result.data;

    const template = await prisma.quotationTemplate.create({
      data: {
        name,
        planId,
        validDays,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId || null,
            quantity: l.quantity,
            unitPriceCents: l.unitPriceCents,
          })),
        },
      },
      include: {
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
