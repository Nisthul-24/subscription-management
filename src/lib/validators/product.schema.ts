import { z } from 'zod';

// ─── PRODUCT SCHEMAS ────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  type: z.enum(['product', 'service']).default('product'),
  salesPriceCents: z.number().int().min(0, 'Sales price must be non-negative'),
  costPriceCents: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required').max(100),
});

export const createVariantSchema = z.object({
  value: z.string().min(1, 'Variant value is required').max(100),
  extraPriceCents: z.number().int().min(0, 'Extra price must be non-negative'),
});

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────────

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
