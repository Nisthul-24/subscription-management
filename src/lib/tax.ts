/**
 * Tax calculation utilities.
 * Taxes are computed on (lineAmount - discount) and added on top (tax-exclusive pricing).
 * Tax rates stored in basis points (1 bps = 0.01%).
 * Rounding: half-up per line, then summed.
 */

import { prisma } from './db';
import { roundHalfUp } from './money';

interface TaxableItem {
  amountCents: number; // lineTotal after discount
  productType: string; // "product" | "service"
}

interface TaxResult {
  taxRuleId: string;
  taxRuleName: string;
  rateBps: number;
  taxCents: number;
}

/**
 * Find applicable tax rules for a product type and calculate taxes.
 */
export async function calculateTaxesForItem(item: TaxableItem): Promise<TaxResult[]> {
  const taxRules = await prisma.taxRule.findMany({
    where: {
      active: true,
      OR: [
        { applicability: 'ALL' },
        { applicability: item.productType.toUpperCase() },
      ],
    },
  });

  return taxRules.map((rule) => ({
    taxRuleId: rule.id,
    taxRuleName: rule.name,
    rateBps: rule.rateBps,
    taxCents: roundHalfUp((item.amountCents * rule.rateBps) / 10000),
  }));
}

/**
 * Calculate total tax for a given amount and rate in basis points.
 */
export function computeTaxCents(amountCents: number, rateBps: number): number {
  return roundHalfUp((amountCents * rateBps) / 10000);
}
