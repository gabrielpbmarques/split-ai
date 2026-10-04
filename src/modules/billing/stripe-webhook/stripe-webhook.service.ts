import { Inject, Injectable, Logger } from '@nestjs/common';

import { TransactionType } from 'src/infrastructure/database/schema/credit-transaction.entity';
import { PaymentStatus } from 'src/infrastructure/database/schema/payment.entity';
import { TransactionExecutor } from 'src/infrastructure/database/transaction-executor/transaction-executor.service';
import {
  PAYMENTS,
  PaymentEvent,
  PaymentsGateway,
} from 'src/infrastructure/integration/payments.port';
import { ManageCreditsService } from 'src/modules/billing/manage-credits/manage-credits.service';
import { PaymentRepository } from 'src/modules/billing/repositories/payment.repository';
import { ActivateOrganizationService } from 'src/modules/organizations/activate-organization/activate-organization.service';
import { DeactivateOrganizationService } from 'src/modules/organizations/deactivate-organization/deactivate-organization.service';

type EventOf<T extends PaymentEvent['type']> = Extract<
  PaymentEvent,
  { type: T }
>;

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    @Inject(PAYMENTS) private readonly payments: PaymentsGateway,
    private readonly paymentRepository: PaymentRepository,
    private readonly manageCreditsService: ManageCreditsService,
    private readonly activateOrganizationService: ActivateOrganizationService,
    private readonly deactivateOrganizationService: DeactivateOrganizationService,
    private readonly transactionExecutor: TransactionExecutor,
  ) {}

  async execute(signature: string, payload: string): Promise<void> {
    const event = this.payments.parseWebhookEvent(payload, signature);

    this.logger.log(`Processando evento de pagamento: ${event.type}`);

    switch (event.type) {
      case 'payment.succeeded':
        return this.handlePaymentSucceeded(event);
      case 'payment.failed':
        return this.handlePaymentFailed(event);
      case 'checkout.completed':
        return this.handleCheckoutCompleted(event);
      case 'subscription.renewed':
        return this.handleSubscriptionRenewed(event);
      case 'subscription.updated':
        this.logger.log(`Assinatura atualizada: ${event.subscriptionId}`);
        return;
      case 'subscription.cancelled':
        return this.handleSubscriptionCancelled(event);
      case 'ignored':
        this.logger.log(`Evento ignorado: ${event.eventType}`);
        return;
    }
  }

  private async handlePaymentSucceeded(
    event: EventOf<'payment.succeeded'>,
  ): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      event.paymentReference,
    );

    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado para a referência ${event.paymentReference}`,
      );
      return;
    }

    await this.transactionExecutor.run(async (tx) => {
      await this.paymentRepository.updateStatus(
        payment.id,
        PaymentStatus.SUCCEEDED,
        { receipt_url: event.receiptUrl },
        tx,
      );

      if (event.credits > 0) {
        await this.manageCreditsService.execute(
          payment.organization_id,
          event.credits,
          TransactionType.PURCHASE,
          `Pagamento aprovado - ${event.credits} créditos adicionados`,
          { paymentId: payment.id, paymentReference: event.paymentReference },
          tx,
        );
      }
    });

    this.logger.log(
      `Pagamento aprovado para a organização ${payment.organization_id}: ${event.credits} créditos`,
    );

    await this.activateOrganizationService.execute(payment.organization_id);
  }

  private async handlePaymentFailed(
    event: EventOf<'payment.failed'>,
  ): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      event.paymentReference,
    );

    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado para a referência ${event.paymentReference}`,
      );
      return;
    }

    await this.paymentRepository.updateStatus(
      payment.id,
      PaymentStatus.FAILED,
      {
        failure_reason: event.reason,
      },
    );

    this.logger.log(
      `Pagamento recusado para a organização ${payment.organization_id}`,
    );
  }

  private async handleCheckoutCompleted(
    event: EventOf<'checkout.completed'>,
  ): Promise<void> {
    if (!event.paid || !event.paymentReference) {
      return;
    }

    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      event.paymentReference,
    );

    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado para a sessão ${event.sessionId}`,
      );
      return;
    }

    this.logger.log(
      `Checkout concluído para a organização ${payment.organization_id}`,
    );
  }

  private async handleSubscriptionRenewed(
    event: EventOf<'subscription.renewed'>,
  ): Promise<void> {
    if (!event.organizationId || event.credits <= 0) {
      return;
    }

    await this.manageCreditsService.execute(
      event.organizationId,
      event.credits,
      TransactionType.PURCHASE,
      `Renovação de assinatura - ${event.credits} créditos adicionados`,
      {
        invoiceId: event.invoiceId,
        ...(event.subscriptionId
          ? { subscriptionId: event.subscriptionId }
          : {}),
      },
    );

    this.logger.log(
      `Assinatura renovada para a organização ${event.organizationId}: ${event.credits} créditos`,
    );

    await this.activateOrganizationService.execute(event.organizationId);
  }

  private async handleSubscriptionCancelled(
    event: EventOf<'subscription.cancelled'>,
  ): Promise<void> {
    this.logger.log(`Assinatura cancelada: ${event.subscriptionId}`);

    if (event.organizationId) {
      await this.deactivateOrganizationService.execute(
        event.organizationId,
        'Subscription deleted',
      );
    }
  }
}
