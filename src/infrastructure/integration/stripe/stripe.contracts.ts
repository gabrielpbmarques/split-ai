import { z } from 'zod';

const stripeMetadataSchema = z.record(z.string()).nullable().optional();

const expandableIdSchema = z
  .union([z.string(), z.object({ id: z.string() }), z.null()])
  .optional();

export const stripePaymentIntentSchema = z.object({
  id: z.string(),
  metadata: stripeMetadataSchema,
  latest_charge: z
    .union([
      z.string(),
      z.object({ receipt_url: z.string().nullable().optional() }),
      z.null(),
    ])
    .optional(),
  last_payment_error: z
    .object({ message: z.string().nullable().optional() })
    .nullable()
    .optional(),
});

export const stripeCheckoutSessionSchema = z.object({
  id: z.string(),
  payment_status: z.string(),
  payment_intent: expandableIdSchema,
});

export const stripeInvoiceSchema = z.object({
  id: z.string(),
  metadata: stripeMetadataSchema,
  subscription: expandableIdSchema,
});

export const stripeSubscriptionSchema = z.object({
  id: z.string(),
  metadata: stripeMetadataSchema,
});

export const stripeEventSchema = z.object({
  type: z.string(),
  data: z.object({ object: z.unknown() }),
});

export type StripePaymentIntent = z.infer<typeof stripePaymentIntentSchema>;
export type StripeCheckoutSession = z.infer<typeof stripeCheckoutSessionSchema>;
export type StripeInvoice = z.infer<typeof stripeInvoiceSchema>;
export type StripeSubscription = z.infer<typeof stripeSubscriptionSchema>;
export type StripeEvent = z.infer<typeof stripeEventSchema>;
