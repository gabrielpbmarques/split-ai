import { Module } from '@nestjs/common';
import { LoadAiChatService } from './load-ai-chat.service';
import { FillPromptModule } from 'src/components/Prompt/FillPrompt/fill-prompt.module';
import { ExecuteSimilaritySearchModule } from '../ExecuteSimilaritySearch/execute-similarity-search.module';
import { GetRunnableChatModule } from '../GetRunnableChat/get-runnable-chat.module';
import { LoadVectorStoreModule } from '../LoadVectorStore/load-vector-store.module';

@Module({
  imports: [
    FillPromptModule,
    ExecuteSimilaritySearchModule,
    GetRunnableChatModule,
    LoadVectorStoreModule,
  ],
  providers: [LoadAiChatService],
  exports: [LoadAiChatService],
})
export class LoadAiChatModule {}
