import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from 'src/components/AIIntegration/Common/generate-ai-response.module';

@Module({
  imports: [GenerateAiResponseModule],
  exports: [GenerateAiResponseModule],
})
export class AIIntegrationModule {}
