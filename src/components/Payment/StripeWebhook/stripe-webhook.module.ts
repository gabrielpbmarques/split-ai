import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ManageCreditsModule } from '../../Credits/ManageCredits/manage-credits.module';
import { ActivateOrganizationModule } from '../../Organization/ActivateOrganization/activate-organization.module';
import { DeactivateOrganizationModule } from '../../Organization/DeactivateOrganization/deactivate-organization.module';

import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  imports: [
    InfrastructureModule,
    RepositoriesModule,
    ManageCreditsModule,
    ActivateOrganizationModule,
    DeactivateOrganizationModule,
  ],
  providers: [StripeWebhookService],
  controllers: [StripeWebhookController],
  exports: [StripeWebhookService],
})
export class StripeWebhookModule {}
