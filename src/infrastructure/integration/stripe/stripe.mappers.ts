import type { z } from 'zod';

import type { PaymentEvent } from 'src/infrastructure/integration/payments.port';
import {
  type StripeCheckoutSession,
  stripeCheckoutSessionSchema,
  type StripeEvent,
  stripeEventSchema,
  type StripeInvoice,
  stripeInvoiceSchema,
  type StripePaymentIntent,
  stripePaymentIntentSchema,
  type StripeSubscription,
  stripeSubscriptionSchema,
} from 'src/infrastructure/integration/stripe/stripe.contracts';

export class StripePayloadError extends Error {
  constructor(
    readonly eventType: string,
    readonly issues: z.ZodIssue[],
  ) {
    super(`Payload inválido para o evento Stripe ${eventType}`);
    this.name = 'StripePayloadError';
  }
}

function creditsFromMetadata(
  metadata: Readonly<Record<string, string>> | null | undefined,
): number {
  const parsed = Number.parseInt(metadata?.credits ?? '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function expandableId(
  value: string | { id?: string } | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.id;
}

export function mapPaymentIntentSucceeded(
  intent: StripePaymentIntent,
): PaymentEvent {
  const charge = intent.latest_charge;
  const receiptUrl =
    charge && typeof charge !== 'string' ? (charge.receipt_url ?? null) : null;

  return {
    type: 'payment.succeeded',
    paymentReference: intent.id,
    credits: creditsFromMetadata(intent.metadata),
    receiptUrl,
  };
}

export function mapPaymentIntentFailed(
  intent: StripePaymentIntent,
): PaymentEvent {
  return {
    type: 'payment.failed',
    paymentReference: intent.id,
    reason: intent.last_payment_error?.message || 'Payment failed',
  };
}

export function mapCheckoutSessionCompleted(
  session: StripeCheckoutSession,
): PaymentEvent {
  return {
    type: 'checkout.completed',
    sessionId: session.id,
    paymentReference: expandableId(session.payment_intent) ?? null,
    paid: session.payment_status === 'paid',
  };
}

export function mapInvoicePaymentSucceeded(
  invoice: StripeInvoice,
): PaymentEvent {
  return {
    type: 'subscription.renewed',
    invoiceId: invoice.id,
    subscriptionId: expandableId(invoice.subscription),
    organizationId: invoice.metadata?.organizationId,
    credits: creditsFromMetadata(invoice.metadata),
  };
}

export function mapSubscriptionUpdated(
  subscription: StripeSubscription,
): PaymentEvent {
  return { type: 'subscription.updated', subscriptionId: subscription.id };
}

export function mapSubscriptionDeleted(
  subscription: StripeSubscription,
): PaymentEvent {
  return {
    type: 'subscription.cancelled',
    subscriptionId: subscription.id,
    organizationId: subscription.metadata?.organizationId,
  };
}

function parseObject<T>(
  eventType: string,
  schema: z.ZodType<T>,
  object: unknown,
): T {
  const result = schema.safeParse(object);

  if (!result.success) {
    throw new StripePayloadError(eventType, result.error.issues);
  }

  return result.data;
}

export function mapStripeEvent(raw: unknown): PaymentEvent {
  const event: StripeEvent = parseObject('event', stripeEventSchema, raw);
  const { type, data } = event;

  switch (type) {
    case 'payment_intent.succeeded':
      return mapPaymentIntentSucceeded(
        parseObject(type, stripePaymentIntentSchema, data.object),
      );
    case 'payment_intent.payment_failed':
      return mapPaymentIntentFailed(
        parseObject(type, stripePaymentIntentSchema, data.object),
      );
    case 'checkout.session.completed':
      return mapCheckoutSessionCompleted(
        parseObject(type, stripeCheckoutSessionSchema, data.object),
      );
    case 'invoice.payment_succeeded':
      return mapInvoicePaymentSucceeded(
        parseObject(type, stripeInvoiceSchema, data.object),
      );
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return mapSubscriptionUpdated(
        parseObject(type, stripeSubscriptionSchema, data.object),
      );
    case 'customer.subscription.deleted':
      return mapSubscriptionDeleted(
        parseObject(type, stripeSubscriptionSchema, data.object),
      );
    default:
      return { type: 'ignored', eventType: type };
  }
}
