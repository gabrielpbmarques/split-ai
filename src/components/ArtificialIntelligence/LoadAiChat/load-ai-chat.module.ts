import { Module } from '@nestjs/common';
import { ExecuteSimilaritySearchModule } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.module';
import { FillPromptModule } from 'src/components/ArtificialIntelligence/FillPrompt/fill-prompt.module';
import { GetRunnableChatModule } from 'src/components/ArtificialIntelligence/GetRunnableChat/get-runnable-chat.module';
import { LoadVectorStoreModule } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.module';

import { LoadAiChatService } from './load-ai-chat.service';

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
