import { Module } from '@nestjs/common';
import { CreateHistoryModule } from './CreateHistory/create-history.module';
import { ExecuteSimilaritySearchModule } from './ExecuteSimilaritySearch/execute-similarity-search.module';
import { GetRunnableChatModule } from './GetRunnableChat/get-runnable-chat.module';
import { LoadAiChatModule } from './LoadAiChat/load-ai-chat.module';
import { LoadVectorStoreModule } from './LoadVectorStore/load-vector-store.module';

@Module({
  imports: [
    CreateHistoryModule,
    ExecuteSimilaritySearchModule,
    GetRunnableChatModule,
    LoadAiChatModule,
    LoadVectorStoreModule,
  ],
  exports: [
    CreateHistoryModule,
    ExecuteSimilaritySearchModule,
    GetRunnableChatModule,
    LoadAiChatModule,
    LoadVectorStoreModule,
  ],
})
export class LangchainModule {}
