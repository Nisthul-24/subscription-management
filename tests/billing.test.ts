import { describe, it, expect } from 'vitest';
import { computeTaxCents } from '../src/lib/tax';
import { roundHalfUp, calculateDiscountCents } from '../src/lib/money';
import { addMonths, addYears, addDays, addWeeks } from 'date-fns';

describe('Billing Engine & Arithmetic Validation', () => {
  it('correctly calculates half-up rounded tax on line items with basis points', () => {
    // 18.00% on $49.00 (4900 cents) = 882 cents
    expect(computeTaxCents(4900, 1800)).toBe(882);

    // 10.00% on $29.00 (2900 cents) = 290 cents
    expect(computeTaxCents(2900, 1000)).toBe(290);

    // Half-up rounding test: 18.5% (1850 bps) on $15.55 (1555 cents)
    // 1555 * 1850 / 10000 = 287.675 cents -> 288 cents
    expect(computeTaxCents(1555, 1850)).toBe(288);
  });

  it('correctly applies percentage and fixed discounts', () => {
    // 15% discount (1500 bps) on $49.00 (4900 cents) = 735 cents
    const discCents = calculateDiscountCents(4900, 'PERCENTAGE', 0, 1500);
    expect(discCents).toBe(735);

    // Fixed $10 discount (1000 cents) on $49.00
    const fixedCents = calculateDiscountCents(4900, 'FIXED', 1000, 0);
    expect(fixedCents).toBe(1000);

    // Discount capped at total amount
    const capped = calculateDiscountCents(500, 'FIXED', 1000, 0);
    expect(capped).toBe(500);
  });

  it('correctly advances billing dates across frequencies with leap year and month-end awareness', () => {
    const baseDate = new Date('2026-01-31T00:00:00.000Z');

    // Monthly advance from Jan 31 -> Feb 28
    const nextMonth = addMonths(baseDate, 1);
    expect(nextMonth.getUTCDate()).toBe(28);
    expect(nextMonth.getUTCMonth()).toBe(1); // February (0-indexed)

    // Weekly advance
    const nextWeek = addWeeks(baseDate, 1);
    expect(nextWeek.getUTCDate()).toBe(7);
    expect(nextWeek.getUTCMonth()).toBe(1);

    // Daily advance
    const nextDay = addDays(baseDate, 1);
    expect(nextDay.getUTCDate()).toBe(1);
    expect(nextDay.getUTCMonth()).toBe(1);

    // Yearly advance
    const nextYear = addYears(baseDate, 1);
    expect(nextYear.getUTCFullYear()).toBe(2027);
    expect(nextYear.getUTCMonth()).toBe(0); // January
    expect(nextYear.getUTCDate()).toBe(31);
  });
});
