import { Module } from '@nestjs/common';
import { TwilioProviderModule } from 'src/infrastructure/providers/twilio.provider.module';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TwilioProviderModule, UserRepositoryModule],
  providers: [WebhookService],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}
