import { Module } from '@nestjs/common';
import { StartRegistrationModule } from './StartRegistration/start-registration.module';
import { ProcessMessageModule } from './ProcessMessage/process-message.module';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';

@Module({
  imports: [
    StartRegistrationModule,
    ProcessMessageModule,
    GenerateAiResponseModule,
  ],
  exports: [
    StartRegistrationModule,
    ProcessMessageModule,
    GenerateAiResponseModule,
  ],
})
export class RegisterModule {}
