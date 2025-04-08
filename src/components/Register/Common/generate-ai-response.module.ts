import { Module } from '@nestjs/common';
import { GenerateAiResponseService } from './generate-ai-response.service';
import { LoadAiChatModule } from '../../Langchain/LoadAiChat/load-ai-chat.module';

@Module({
  imports: [LoadAiChatModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
