import { Module } from '@nestjs/common';
import { LoadAiChatService } from 'src/components/Langchain/LoadAiChat/load-ai-chat.service';
import { ExecuteSimilaritySearchModule } from 'src/components/Langchain/ExecuteSimilaritySearch/execute-similarity-search.module';
import { GetRunnableChatModule } from 'src/components/Langchain/GetRunnableChat/get-runnable-chat.module';
import { LoadVectorStoreModule } from 'src/components/Langchain/LoadVectorStore/load-vector-store.module';
import { FillPromptModule } from 'src/components/Prompt/FillPrompt/fill-prompt.module';

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
