import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { createTaxRuleSchema } from '@/lib/validators/tax-discount.schema';

export const GET = withAuth(['ADMIN', 'STAFF'], async () => {
  const taxRules = await prisma.taxRule.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ taxRules });
});

export const POST = withAuth(['ADMIN'], async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = createTaxRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const taxRule = await prisma.taxRule.create({
      data: result.data,
    });

    return NextResponse.json({ taxRule }, { status: 201 });
  } catch (error) {
    console.error('Create tax rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
