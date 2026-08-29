import { Module } from '@nestjs/common';

import { WebhookModule } from './Webhook/webhook.module';

@Module({
  imports: [WebhookModule],
})
export class WhatsappModule {}
