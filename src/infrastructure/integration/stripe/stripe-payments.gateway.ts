import { BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import {
  IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import {
  CheckoutMode,
  CheckoutRequest,
  CheckoutSession,
  PaymentEvent,
  PaymentsGateway,
} from 'src/infrastructure/integration/payments.port';
import {
  mapStripeEvent,
  StripePayloadError,
} from 'src/infrastructure/integration/stripe/stripe.mappers';
import { env } from 'src/shared/config/env';

const STRIPE_API_VERSION = '2023-10-16';

export class StripePaymentsGateway implements PaymentsGateway {
  readonly name = 'stripe';

  private readonly logger = new Logger(StripePaymentsGateway.name);
  private readonly client?: Stripe;

  constructor() {
    if (env.STRIPE_SECRET_KEY) {
      this.client = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
        typescript: true,
      });
    }
  }

  state(): IntegrationState {
    return this.client && env.STRIPE_WEBHOOK_SECRET
      ? 'READY'
      : 'NOT_CONFIGURED';
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const stripe = this.client ?? notConfigured(this.name);
    const { customer, plan, successUrl, cancelUrl } = request;

    const customerId = await this.findOrCreateCustomer(stripe, customer);
    const isSubscription =
      plan.billingPeriod === 'monthly' || plan.billingPeriod === 'yearly';
    const mode: CheckoutMode = isSubscription ? 'subscription' : 'payment';

    const metadata = {
      organizationId: customer.organizationId,
      planType: plan.type,
      credits: plan.credits.toString(),
    };

    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency: 'brl',
      product_data: {
        name: plan.name,
        description: plan.description || `${plan.credits} créditos`,
        metadata: { planType: plan.type, credits: plan.credits.toString() },
      },
      unit_amount: plan.priceCents,
      ...(isSubscription
        ? {
            recurring: {
              interval: plan.billingPeriod === 'monthly' ? 'month' : 'year',
            },
          }
        : {}),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: isSubscription
        ? ['card']
        : ['card', 'boleto', 'pix'],
      line_items: [{ price_data: priceData, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      metadata,
      locale: 'pt-BR',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_options: isSubscription
        ? {}
        : {
            boleto: { expires_after_days: 3 },
            card: { installments: { enabled: true } },
          },
      ...(isSubscription
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
    });

    const paymentReference =
      (typeof session.payment_intent === 'string' && session.payment_intent) ||
      (typeof session.subscription === 'string' && session.subscription) ||
      session.id;

    return { sessionId: session.id, url: session.url, paymentReference, mode };
  }

  parseWebhookEvent(rawBody: string, signature: string): PaymentEvent {
    const stripe = this.client ?? notConfigured(this.name);

    if (!env.STRIPE_WEBHOOK_SECRET) {
      notConfigured(this.name);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      this.logger.warn(
        `Assinatura do webhook Stripe inválida: ${(error as Error).message}`,
      );
      throw new BadRequestException('Assinatura do webhook inválida');
    }

    try {
      return mapStripeEvent(event);
    } catch (error) {
      if (error instanceof StripePayloadError) {
        this.logger.warn(
          { eventType: error.eventType, issues: error.issues },
          'Payload do webhook Stripe fora do contrato',
        );
        throw new BadRequestException('Payload do webhook inválido');
      }

      throw error;
    }
  }

  private async findOrCreateCustomer(
    stripe: Stripe,
    customer: CheckoutRequest['customer'],
  ): Promise<string> {
    const existing = await stripe.customers.list({
      email: customer.email,
      limit: 1,
    });

    if (existing.data.length > 0) {
      return existing.data[0].id;
    }

    const created = await stripe.customers.create({
      email: customer.email,
      name: customer.name,
      metadata: { organizationId: customer.organizationId },
    });

    return created.id;
  }
}
