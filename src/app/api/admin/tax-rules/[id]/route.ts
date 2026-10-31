import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { updateTaxRuleSchema } from '@/lib/validators/tax-discount.schema';

export const PUT = withAuth(['ADMIN'], async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateTaxRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const taxRule = await prisma.taxRule.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ taxRule });
  } catch (error) {
    console.error('Update tax rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withAuth(['ADMIN'], async (req, { params }) => {
  try {
    const { id } = await params;
    const taxRule = await prisma.taxRule.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ taxRule, message: 'Tax rule deactivated' });
  } catch (error) {
    console.error('Delete tax rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
