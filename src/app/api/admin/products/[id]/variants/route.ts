import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const addVariantSchema = z.object({
  attributeName: z.string().min(1, 'Attribute name is required'),
  variantValue: z.string().min(1, 'Variant value is required'),
  extraPriceCents: z.number().int().min(0).default(0),
});

export const POST = withAuth(['ADMIN'], async (req: NextRequest, { params }) => {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    const result = addVariantSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { attributeName, variantValue, extraPriceCents } = result.data;

    // Check if attribute already exists for this product
    let attribute = await prisma.productAttribute.findFirst({
      where: {
        productId,
        name: { equals: attributeName, mode: 'insensitive' },
      },
    });

    if (!attribute) {
      attribute = await prisma.productAttribute.create({
        data: {
          productId,
          name: attributeName,
        },
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        attributeId: attribute.id,
        value: variantValue,
        extraPriceCents,
      },
    });

    return NextResponse.json({ variant, attribute }, { status: 201 });
  } catch (error) {
    console.error('Add variant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
