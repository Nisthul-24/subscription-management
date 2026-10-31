/**
 * Money utilities — all amounts stored as integer cents.
 * Tax rates stored as basis points (1 bps = 0.01%).
 *
 * Rounding rule: half-up (standard commercial rounding).
 */

/** Round a number using half-up rounding to the nearest integer */
export function roundHalfUp(value: number): number {
  return Math.round(value);
}

/** Convert cents to a display string (e.g. 1250 -> "$12.50") */
export function formatCents(cents: number, currency = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export const formatMoney = formatCents;

/** Convert a dollar string to cents (e.g. "12.50" -> 1250) */
export function dollarsToCents(dollars: string | number): number {
  const value = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  return roundHalfUp(value * 100);
}

/** Calculate tax in cents given an amount in cents and a rate in basis points */
export function calculateTaxCents(amountCents: number, rateBps: number): number {
  return roundHalfUp((amountCents * rateBps) / 10000);
}

/**
 * Calculate discount in cents.
 * For FIXED: returns valueCents directly.
 * For PERCENTAGE: calculates from the line amount.
 */
export function calculateDiscountCents(
  lineAmountCents: number,
  discountType: 'FIXED' | 'PERCENTAGE',
  valueCents: number,
  valueBps: number
): number {
  if (discountType === 'FIXED') {
    // Discount cannot exceed the line amount
    return Math.min(valueCents, lineAmountCents);
  }
  // PERCENTAGE
  return Math.min(roundHalfUp((lineAmountCents * valueBps) / 10000), lineAmountCents);
}

/** Calculate line total: quantity × unit price */
export function lineTotalCents(quantity: number, unitPriceCents: number): number {
  return quantity * unitPriceCents;
}

/**
 * Calculate the effective unit price of a product with an optional variant.
 * effectivePrice = baseSalesPrice + variantExtraPrice
 */
export function effectivePrice(salesPriceCents: number, variantExtraCents: number = 0): number {
  return salesPriceCents + variantExtraCents;
}

/** Format basis points as a percentage string (e.g. 1800 -> "18.00%") */
export function bpsToPercentage(bps: number): string {
  return (bps / 100).toFixed(2) + '%';
}

/** Convert a percentage number to basis points (e.g. 18 -> 1800) */
export function percentageToBps(pct: number): number {
  return roundHalfUp(pct * 100);
}
