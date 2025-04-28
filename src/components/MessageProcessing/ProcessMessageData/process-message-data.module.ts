import { Module } from '@nestjs/common';
import { ProcessMessageDataService } from './process-message-data.service';
import { GenerateAiResponseModule } from '../../AIIntegration/Common/generate-ai-response.module';

@Module({
  imports: [GenerateAiResponseModule],
  providers: [ProcessMessageDataService],
  exports: [ProcessMessageDataService],
})
export class ProcessMessageDataModule {}
