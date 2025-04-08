import { Module } from '@nestjs/common';
import { StartRegistrationModule } from './StartRegistration/start-registration.module';
import { ProcessMessageModule } from './ProcessMessage/process-message.module';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';
import { WhatsappMessageModule } from './WhatsappMessage/whatsapp-message.module';

@Module({
  imports: [
    StartRegistrationModule,
    ProcessMessageModule,
    GenerateAiResponseModule,
    WhatsappMessageModule,
  ],
  exports: [
    StartRegistrationModule,
    ProcessMessageModule,
    GenerateAiResponseModule,
    WhatsappMessageModule,
  ],
})
export class RegisterModule {}
