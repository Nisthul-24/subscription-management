import { z } from 'zod';

// ─── PLAN SCHEMAS ───────────────────────────────────────────────────────────────

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(200),
  priceCents: z.number().int().min(0, 'Price must be non-negative'),
  billingPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  minQuantity: z.number().int().min(1).default(1),
  availableFrom: z.string().datetime().optional().nullable(),
  availableTo: z.string().datetime().optional().nullable(),
  autoCloseAtEnd: z.boolean().default(false),
  closableEarly: z.boolean().default(true),
  pausable: z.boolean().default(false),
  renewable: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────────

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
