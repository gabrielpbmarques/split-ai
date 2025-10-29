import { Module } from '@nestjs/common';

import { WebhookModule } from './Webhook/webhook.module';

@Module({
  imports: [WebhookModule],
  exports: [WebhookModule],
})
export class WhatsappModule {}
