import { Module } from '@nestjs/common';
import { CreateHistoryModule } from 'src/components/Langchain/CreateHistory/create-history.module';
import { ExecuteSimilaritySearchModule } from 'src/components/Langchain/ExecuteSimilaritySearch/execute-similarity-search.module';
import { GetRunnableChatModule } from 'src/components/Langchain/GetRunnableChat/get-runnable-chat.module';
import { LoadAiChatModule } from 'src/components/Langchain/LoadAiChat/load-ai-chat.module';
import { LoadVectorStoreModule } from 'src/components/Langchain/LoadVectorStore/load-vector-store.module';

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
