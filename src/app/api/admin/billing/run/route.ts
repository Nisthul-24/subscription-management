import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { runBilling } from '@/lib/billing';
import { manualBillingSchema } from '@/lib/validators/subscription.schema';

export const POST = withAuth(['ADMIN'], async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = manualBillingSchema.safeParse(body);

    const billingDate = result.success && result.data.date ? new Date(result.data.date) : new Date();

    const outcome = await runBilling(billingDate);

    return NextResponse.json({
      message: `Billing run complete. Generated ${outcome.generated} invoice(s), auto-closed ${outcome.autoClosed} expired subscription(s).`,
      generated: outcome.generated,
      autoClosed: outcome.autoClosed,
      errors: outcome.errors,
      billingDate,
    });
  } catch (error) {
    console.error('Billing run error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
