import { Module } from '@nestjs/common';
import { ProcessMessageDataService } from 'src/components/ArtificialIntelligence/MessageProcessing/ProcessMessageData/process-message-data.service';
import { GenerateAiResponseModule } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.module';

@Module({
  imports: [GenerateAiResponseModule],
  providers: [ProcessMessageDataService],
  exports: [ProcessMessageDataService],
})
export class ProcessMessageDataModule {}
