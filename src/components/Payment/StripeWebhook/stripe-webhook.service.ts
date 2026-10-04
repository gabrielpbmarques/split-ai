import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ManageCreditsService } from 'src/components/Credits/ManageCredits/manage-credits.service';
import { ActivateOrganizationService } from 'src/components/Organization/ActivateOrganization/activate-organization.service';
import { DeactivateOrganizationService } from 'src/components/Organization/DeactivateOrganization/deactivate-organization.service';
import { TransactionType } from 'src/entities/credit-transaction.entity';
import { PaymentStatus } from 'src/entities/payment.entity';
import { STRIPE_CLIENT } from 'src/infrastructure/providers/stripe.provider';
import { PaymentRepository } from 'src/repositories/payment.repository';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly paymentRepository: PaymentRepository,
    private readonly manageCreditsService: ManageCreditsService,
    private readonly activateOrganizationService: ActivateOrganizationService,
    private readonly deactivateOrganizationService: DeactivateOrganizationService,
  ) {}

  async execute(
    signature: string,
    payload: string,
    webhookSecret: string,
  ): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException('Assinatura do webhook inválida');
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (!payment) {
      this.logger.warn(
        `Payment not found for payment_intent: ${paymentIntent.id}`,
      );
      return;
    }

    // Update payment status
    await this.paymentRepository.updateStatus(
      payment.id,
      PaymentStatus.SUCCEEDED,
      {
        receipt_url: paymentIntent.latest_charge
          ? typeof paymentIntent.latest_charge === 'string'
            ? null
            : (paymentIntent.latest_charge as any)?.receipt_url
          : null,
      },
    );

    // Add credits to organization
    const credits = parseInt(paymentIntent.metadata?.credits || '0', 10);
    if (credits > 0) {
      await this.manageCreditsService.execute(
        payment.organization_id,
        credits,
        TransactionType.PURCHASE,
        `Pagamento aprovado - ${credits} créditos adicionados`,
        {
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntent.id,
        },
      );
    }

    this.logger.log(
      `Payment succeeded for organization ${payment.organization_id}: ${credits} credits added`,
    );

    // Activate organization
    await this.activateOrganizationService.execute(payment.organization_id);
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (!payment) {
      this.logger.warn(
        `Payment not found for payment_intent: ${paymentIntent.id}`,
      );
      return;
    }

    await this.paymentRepository.updateStatus(
      payment.id,
      PaymentStatus.FAILED,
      {
        failure_reason:
          paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    );

    this.logger.log(
      `Payment failed for organization ${payment.organization_id}`,
    );
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (session.payment_status !== 'paid') {
      return;
    }

    const paymentIntentId = session.payment_intent as string;
    const payment =
      await this.paymentRepository.findByStripePaymentIntentId(paymentIntentId);

    if (!payment) {
      this.logger.warn(`Payment not found for session: ${session.id}`);
      return;
    }

    // Payment will be handled by payment_intent.succeeded webhook
    this.logger.log(
      `Checkout session completed for organization ${payment.organization_id}`,
    );
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    // Handle subscription renewals
    const rawSubscription = (invoice as any)?.subscription as
      | string
      | { id?: string }
      | null
      | undefined;
    const subscriptionId =
      typeof rawSubscription === 'string'
        ? rawSubscription
        : rawSubscription?.id;
    const credits = parseInt(invoice.metadata?.credits || '0', 10);
    const organizationId = invoice.metadata?.organizationId;

    if (!organizationId || credits <= 0) {
      return;
    }

    // Add credits for subscription renewal
    await this.manageCreditsService.execute(
      organizationId,
      credits,
      TransactionType.PURCHASE,
      `Renovação de assinatura - ${credits} créditos adicionados`,
      {
        stripeInvoiceId: invoice.id,
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      },
    );

    this.logger.log(
      `Subscription renewed for organization ${organizationId}: ${credits} credits added`,
    );

    // Activate organization
    await this.activateOrganizationService.execute(organizationId);
  }

  private async handleSubscriptionUpdate(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    // Implementation for subscription updates
    this.logger.log(`Subscription updated: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    // Implementation for subscription cancellation
    this.logger.log(`Subscription deleted: ${subscription.id}`);

    const organizationId = subscription.metadata?.organizationId;

    if (organizationId) {
      await this.deactivateOrganizationService.execute(
        organizationId,
        'Subscription deleted',
      );
    }
  }
}
