import { Injectable, Inject, BadRequestException } from '@nestjs/common';

import { PaymentStatus } from 'src/infrastructure/database/schema/payment.entity';
import { PlanType } from 'src/infrastructure/database/schema/plan.entity';
import {
  PAYMENTS,
  PaymentsGateway,
} from 'src/infrastructure/integration/payments.port';
import { PaymentRepository } from 'src/modules/billing/repositories/payment.repository';
import { PlanRepository } from 'src/modules/billing/repositories/plan.repository';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';

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

const CENTS_PER_UNIT = 100;

@Injectable()
export class CreateCheckoutService {
  constructor(
    @Inject(PAYMENTS) private readonly payments: PaymentsGateway,
    private readonly organizationRepository: OrganizationRepository,
    private readonly planRepository: PlanRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    const { organizationId, planType, successUrl, cancelUrl } = dto;

    const [organization, plan] = await Promise.all([
      this.organizationRepository.findById(organizationId),
      this.planRepository.findByType(planType),
    ]);

    if (!organization) {
      throw new BadRequestException('Organização não encontrada');
    }

    if (!plan) {
      throw new BadRequestException('Plano não encontrado');
    }

    const session = await this.payments.createCheckout({
      customer: {
        email: organization.contact_email,
        name: organization.name,
        organizationId: organization.id,
      },
      plan: {
        type: plan.type,
        name: plan.name,
        description: plan.description,
        priceCents: Math.round(plan.price * CENTS_PER_UNIT),
        credits: plan.credits,
        billingPeriod: plan.billing_period,
      },
      successUrl,
      cancelUrl,
    });

    const isSubscription = session.mode === 'subscription';

    await this.paymentRepository.create({
      organization_id: organizationId,
      plan_id: plan.id,
      stripe_payment_intent_id: session.paymentReference,
      amount: plan.price,
      currency: 'BRL',
      credits_purchased: plan.credits,
      status: PaymentStatus.PENDING,
      description: isSubscription
        ? `Assinatura - Plano ${plan.name}`
        : `Compra de ${plan.credits} créditos - Plano ${plan.name}`,
      metadata: { sessionId: session.sessionId, planType, mode: session.mode },
    });

    return { url: session.url, sessionId: session.sessionId };
  }
}
