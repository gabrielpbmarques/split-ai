import { Module } from '@nestjs/common';

import { WebhookModule } from 'src/modules/whatsapp/webhook/webhook.module';

@Module({
  imports: [WebhookModule],
  exports: [WebhookModule],
})
export class WhatsappModule {}
