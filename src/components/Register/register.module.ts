import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';
import { WhatsappMessageModule } from './WhatsappMessage/whatsapp-message.module';

@Module({
  imports: [GenerateAiResponseModule, WhatsappMessageModule],
  exports: [GenerateAiResponseModule, WhatsappMessageModule],
})
export class RegisterModule {}
