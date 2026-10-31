import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createProductSchema } from '@/lib/validators/product.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async () => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      attributes: {
        include: {
          variants: true,
        },
      },
    },
  });

  return NextResponse.json({ products });
});

export const POST = withAuth(['ADMIN'], async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: result.data,
      include: {
        attributes: {
          include: {
            variants: true,
          },
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
