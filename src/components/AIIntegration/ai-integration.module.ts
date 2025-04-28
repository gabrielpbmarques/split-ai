import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';

@Module({
  imports: [GenerateAiResponseModule],
  exports: [GenerateAiResponseModule],
})
export class AIIntegrationModule {}
