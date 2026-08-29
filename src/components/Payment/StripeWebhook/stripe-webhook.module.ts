import { Module } from '@nestjs/common';
import { StripeProviderModule } from 'src/infrastructure/providers/stripe.provider.module';
import { PaymentRepositoryModule } from 'src/repositories/payment.repository.module';

import { ManageCreditsModule } from '../../Credits/ManageCredits/manage-credits.module';
import { ActivateOrganizationModule } from '../../Organization/ActivateOrganization/activate-organization.module';
import { DeactivateOrganizationModule } from '../../Organization/DeactivateOrganization/deactivate-organization.module';

import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';

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
