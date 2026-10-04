import { randomUUID } from 'crypto';

import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentEvent,
  PaymentsGateway,
} from 'src/infrastructure/integration/payments.port';
import { mapStripeEvent } from 'src/infrastructure/integration/stripe/stripe.mappers';

export class MockPaymentsGateway implements PaymentsGateway {
  readonly name = 'stripe';

  readonly checkouts: CheckoutRequest[] = [];

  state(): IntegrationState {
    return 'MOCK';
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    this.checkouts.push(request);

    const sessionId = `cs_mock_${randomUUID()}`;
    const isSubscription =
      request.plan.billingPeriod === 'monthly' ||
      request.plan.billingPeriod === 'yearly';

    return {
      sessionId,
      url: `https://checkout.mock.local/${sessionId}`,
      paymentReference: `pi_mock_${randomUUID()}`,
      mode: isSubscription ? 'subscription' : 'payment',
    };
  }

  parseWebhookEvent(rawBody: string): PaymentEvent {
    return mapStripeEvent(JSON.parse(rawBody));
  }
}
