import { z } from 'zod';

// ─── TAX RULE SCHEMAS ───────────────────────────────────────────────────────────

export const createTaxRuleSchema = z.object({
  name: z.string().min(1, 'Tax rule name is required').max(200),
  rateBps: z.number().int().min(0).max(10000, 'Rate cannot exceed 100%'),
  applicability: z.enum(['ALL', 'PRODUCT', 'SERVICE']).default('ALL'),
});

export const updateTaxRuleSchema = createTaxRuleSchema.partial();

// ─── DISCOUNT RULE SCHEMAS ──────────────────────────────────────────────────────

export const createDiscountRuleSchema = z.object({
  name: z.string().min(1, 'Discount name is required').max(200),
  discountType: z.enum(['FIXED', 'PERCENTAGE']),
  valueCents: z.number().int().min(0).default(0),
  valueBps: z.number().int().min(0).max(10000).default(0),
  minPurchaseCents: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  scope: z.enum(['PRODUCT', 'SUBSCRIPTION']),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updateDiscountRuleSchema = createDiscountRuleSchema.partial();

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────────

export type CreateTaxRuleInput = z.infer<typeof createTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof updateTaxRuleSchema>;
export type CreateDiscountRuleInput = z.infer<typeof createDiscountRuleSchema>;
export type UpdateDiscountRuleInput = z.infer<typeof updateDiscountRuleSchema>;
