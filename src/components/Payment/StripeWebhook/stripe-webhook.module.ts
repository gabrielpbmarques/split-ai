import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ManageCreditsModule } from '../../Credits/ManageCredits/manage-credits.module';

import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  imports: [InfrastructureModule, RepositoriesModule, ManageCreditsModule],
  providers: [StripeWebhookService],
  controllers: [StripeWebhookController],
  exports: [StripeWebhookService],
})
export class StripeWebhookModule {}
