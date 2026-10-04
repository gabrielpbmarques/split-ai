import { Module } from '@nestjs/common';

import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';
import { WebhookController } from 'src/modules/whatsapp/webhook/webhook.controller';
import { WebhookService } from 'src/modules/whatsapp/webhook/webhook.service';

@Module({
  imports: [UserRepositoryModule],
  providers: [WebhookService],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}
