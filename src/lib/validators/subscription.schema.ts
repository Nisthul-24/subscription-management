import { z } from 'zod';

// ─── SUBSCRIPTION SCHEMAS ───────────────────────────────────────────────────────

export const subscriptionLineSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().min(0),
  taxRuleIds: z.array(z.string().min(1)).optional(),
});

export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Invalid customer ID'),
  planId: z.string().min(1, 'Invalid plan ID'),
  startDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional().nullable(),
  paymentTermsDays: z.number().int().min(1).max(365).default(15),
  notes: z.string().optional(),
  lines: z.array(subscriptionLineSchema).min(1, 'At least one line is required'),
});

export const updateSubscriptionSchema = z.object({
  paymentTermsDays: z.number().int().min(1).max(365).optional(),
  notes: z.string().optional(),
  lines: z.array(subscriptionLineSchema).optional(),
});

export const transitionSubscriptionSchema = z.object({
  action: z.enum(['submit_quotation', 'confirm', 'activate', 'pause', 'resume', 'close']),
  reason: z.string().optional(),
});

// ─── QUOTATION TEMPLATE SCHEMAS ─────────────────────────────────────────────────

export const quotationTemplateLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  unitPriceCents: z.number().int().min(0),
});

export const createQuotationTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200),
  planId: z.string().min(1, 'Invalid plan ID'),
  validDays: z.number().int().min(1).max(365).default(30),
  lines: z.array(quotationTemplateLineSchema).min(1, 'At least one line is required'),
});

export const updateQuotationTemplateSchema = createQuotationTemplateSchema.partial();

// ─── INVOICE SCHEMAS ────────────────────────────────────────────────────────────

export const invoiceActionSchema = z.object({
  action: z.enum(['confirm', 'cancel', 'send']),
  reason: z.string().optional(),
});

// ─── PAYMENT SCHEMAS ────────────────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invalid invoice ID'),
  method: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'CHECK', 'OTHER']),
  amountCents: z.number().int().min(1, 'Payment amount must be positive'),
  paymentDate: z.string().datetime(),
  note: z.string().optional(),
});

// ─── BILLING SCHEMAS ────────────────────────────────────────────────────────────

export const manualBillingSchema = z.object({
  date: z.string().datetime(),
});

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────────

export type SubscriptionLineInput = z.infer<typeof subscriptionLineSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type TransitionSubscriptionInput = z.infer<typeof transitionSubscriptionSchema>;
export type QuotationTemplateLineInput = z.infer<typeof quotationTemplateLineSchema>;
export type CreateQuotationTemplateInput = z.infer<typeof createQuotationTemplateSchema>;
export type UpdateQuotationTemplateInput = z.infer<typeof updateQuotationTemplateSchema>;
export type InvoiceActionInput = z.infer<typeof invoiceActionSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ManualBillingInput = z.infer<typeof manualBillingSchema>;
