import type { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const PAYMENTS = Symbol('PAYMENTS');

export interface CheckoutCustomer {
  readonly email: string;
  readonly name: string;
  readonly organizationId: string;
}

export interface CheckoutPlan {
  readonly type: string;
  readonly name: string;
  readonly description?: string | null;
  readonly priceCents: number;
  readonly credits: number;
  readonly billingPeriod?: string | null;
}

export interface CheckoutRequest {
  readonly customer: CheckoutCustomer;
  readonly plan: CheckoutPlan;
  readonly successUrl: string;
  readonly cancelUrl: string;
}

export type CheckoutMode = 'payment' | 'subscription';

export interface CheckoutSession {
  readonly sessionId: string;
  readonly url: string;
  readonly paymentReference: string;
  readonly mode: CheckoutMode;
}

export type PaymentEvent =
  | {
      readonly type: 'payment.succeeded';
      readonly paymentReference: string;
      readonly credits: number;
      readonly receiptUrl: string | null;
    }
  | {
      readonly type: 'payment.failed';
      readonly paymentReference: string;
      readonly reason: string;
    }
  | {
      readonly type: 'checkout.completed';
      readonly sessionId: string;
      readonly paymentReference: string | null;
      readonly paid: boolean;
    }
  | {
      readonly type: 'subscription.renewed';
      readonly invoiceId: string;
      readonly subscriptionId?: string;
      readonly organizationId?: string;
      readonly credits: number;
    }
  | {
      readonly type: 'subscription.updated';
      readonly subscriptionId: string;
    }
  | {
      readonly type: 'subscription.cancelled';
      readonly subscriptionId: string;
      readonly organizationId?: string;
    }
  | {
      readonly type: 'ignored';
      readonly eventType: string;
    };

export interface PaymentsGateway extends IntegrationGateway {
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  parseWebhookEvent(rawBody: string, signature: string): PaymentEvent;
}
