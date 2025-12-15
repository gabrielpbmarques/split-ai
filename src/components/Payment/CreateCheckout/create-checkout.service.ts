import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from 'src/entities/payment.entity';
import { PlanType } from 'src/entities/plan.entity';
import { STRIPE_CLIENT } from 'src/infrastructure/providers/stripe.provider';
import { OrganizationRepository } from 'src/repositories/organization.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { PlanRepository } from 'src/repositories/plan.repository';
import Stripe from 'stripe';

export interface CreateCheckoutDto {
  organizationId: string;
  planType: PlanType;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

@Injectable()
export class CreateCheckoutService {
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly organizationRepository: OrganizationRepository,
    private readonly planRepository: PlanRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    const { organizationId, planType, successUrl, cancelUrl } = dto;

    // Validate organization
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    // Get plan details
    const plan = await this.planRepository.findByType(planType);
    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    // Create or get Stripe customer
    let stripeCustomerId: string;

    const customers = await this.stripe.customers.list({
      email: organization.contact_email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
    } else {
      const customer = await this.stripe.customers.create({
        email: organization.contact_email,
        name: organization.name,
        metadata: {
          organizationId: organization.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create price data for one-time payment
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency: 'brl',
      product_data: {
        name: plan.name,
        description: plan.description || `${plan.credits} créditos`,
        metadata: {
          planType: plan.type,
          credits: plan.credits.toString(),
        },
      },
      unit_amount: Math.round(plan.price * 100), // Convert to cents
    };

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: stripeCustomerId,
      payment_intent_data: {
        metadata: {
          organizationId,
          planType,
          credits: plan.credits.toString(),
        },
      },
      metadata: {
        organizationId,
        planType,
        credits: plan.credits.toString(),
      },
      locale: 'pt-BR',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_options: {
        card: {
          installments: {
            enabled: true,
          },
        },
        boleto: {
          expires_after_days: 3,
        },
      },
    });

    // Create payment record with pending status
    await this.paymentRepository.create({
      organization_id: organizationId,
      plan_id: plan.id,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: plan.price,
      currency: 'BRL',
      credits_purchased: plan.credits,
      status: PaymentStatus.PENDING,
      description: `Compra de ${plan.credits} créditos - Plano ${plan.name}`,
      metadata: {
        sessionId: session.id,
        planType,
      },
    });

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }
}
