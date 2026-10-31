import { describe, it, expect } from 'vitest';
import {
  roundHalfUp,
  formatCents,
  formatMoney,
  dollarsToCents,
  calculateTaxCents,
  calculateDiscountCents,
  lineTotalCents,
  effectivePrice,
  bpsToPercentage,
  percentageToBps,
} from '../src/lib/money';

describe('Money and Arithmetic Utilities', () => {
  describe('roundHalfUp', () => {
    it('rounds standard fractions half-up', () => {
      expect(roundHalfUp(12.5)).toBe(13);
      expect(roundHalfUp(12.49)).toBe(12);
      expect(roundHalfUp(12.51)).toBe(13);
      expect(roundHalfUp(0)).toBe(0);
    });
  });

  describe('formatCents / formatMoney', () => {
    it('formats cents to USD currency strings with 2 decimals', () => {
      expect(formatCents(1250)).toBe('$12.50');
      expect(formatCents(0)).toBe('$0.00');
      expect(formatCents(999900)).toBe('$9,999.00');
      expect(formatMoney(4900)).toBe('$49.00');
    });
  });

  describe('dollarsToCents', () => {
    it('converts dollar strings or numbers to integer cents', () => {
      expect(dollarsToCents('12.50')).toBe(1250);
      expect(dollarsToCents(49.99)).toBe(4999);
      expect(dollarsToCents(0.01)).toBe(1);
    });
  });

  describe('calculateTaxCents', () => {
    it('computes tax based on basis points with half-up rounding', () => {
      // $100.00 at 18.00% (1800 bps) -> $18.00 (1800 cents)
      expect(calculateTaxCents(10000, 1800)).toBe(1800);
      // $49.00 at 18.00% -> 4900 * 1800 / 10000 = 882 cents
      expect(calculateTaxCents(4900, 1800)).toBe(882);
      // Half-up rounding case: 125 cents at 5.5% (550 bps) = 6.875 -> 7 cents
      expect(calculateTaxCents(125, 550)).toBe(7);
    });
  });

  describe('calculateDiscountCents', () => {
    it('calculates fixed discount without exceeding line total', () => {
      expect(calculateDiscountCents(5000, 'FIXED', 1000, 0)).toBe(1000);
      expect(calculateDiscountCents(500, 'FIXED', 1000, 0)).toBe(500); // capped at line total
    });

    it('calculates percentage discount using basis points', () => {
      // 15% (1500 bps) on $100.00 (10000 cents) -> $15.00 (1500 cents)
      expect(calculateDiscountCents(10000, 'PERCENTAGE', 0, 1500)).toBe(1500);
      // 20% on $49.00 -> 980 cents
      expect(calculateDiscountCents(4900, 'PERCENTAGE', 0, 2000)).toBe(980);
    });
  });

  describe('lineTotalCents & effectivePrice', () => {
    it('computes line total from quantity and unit price', () => {
      expect(lineTotalCents(3, 4900)).toBe(14700);
    });

    it('adds variant extra price to base sales price', () => {
      expect(effectivePrice(4900, 2500)).toBe(7400);
      expect(effectivePrice(4900, 0)).toBe(4900);
    });
  });

  describe('basis points conversions', () => {
    it('converts bps to percentage strings', () => {
      expect(bpsToPercentage(1800)).toBe('18.00%');
      expect(bpsToPercentage(550)).toBe('5.50%');
    });

    it('converts percentage numbers to basis points', () => {
      expect(percentageToBps(18)).toBe(1800);
      expect(percentageToBps(18.5)).toBe(1850);
    });
  });
});
