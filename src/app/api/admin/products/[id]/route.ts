import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { updateProductSchema } from '@/lib/validators/product.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async (req, { params }) => {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      attributes: {
        include: {
          variants: true,
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
});

export const PUT = withAuth(['ADMIN'], async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: result.data,
      include: {
        attributes: {
          include: {
            variants: true,
          },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withAuth(['ADMIN'], async (req, { params }) => {
  try {
    const { id } = await params;
    // Soft delete
    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ product, message: 'Product deactivated' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
