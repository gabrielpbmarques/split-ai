import { Module } from '@nestjs/common';
import { LoadAiChatModule } from 'src/components/Langchain/LoadAiChat/load-ai-chat.module';
import { GenerateAiResponseService } from 'src/components/AIIntegration/Common/generate-ai-response.service';

@Module({
  imports: [LoadAiChatModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
