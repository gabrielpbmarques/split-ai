import { Module } from '@nestjs/common';

import { StripeProviderModule } from 'src/infrastructure/stripe/stripe.provider.module';
import { ManageCreditsModule } from 'src/modules/billing/manage-credits/manage-credits.module';
import { PaymentRepositoryModule } from 'src/modules/billing/repositories/payment.repository.module';
import { StripeWebhookController } from 'src/modules/billing/stripe-webhook/stripe-webhook.controller';
import { StripeWebhookService } from 'src/modules/billing/stripe-webhook/stripe-webhook.service';
import { ActivateOrganizationModule } from 'src/modules/organizations/activate-organization/activate-organization.module';
import { DeactivateOrganizationModule } from 'src/modules/organizations/deactivate-organization/deactivate-organization.module';

@Module({
  imports: [
    ActivateOrganizationModule,
    DeactivateOrganizationModule,
    ManageCreditsModule,
    PaymentRepositoryModule,
    StripeProviderModule,
  ],
  providers: [StripeWebhookService],
  controllers: [StripeWebhookController],
  exports: [StripeWebhookService],
})
export class StripeWebhookModule {}
