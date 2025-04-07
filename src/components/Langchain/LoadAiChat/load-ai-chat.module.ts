import { Module } from '@nestjs/common';
import { LoadAiChatService } from './load-ai-chat.service';
import { FillPromptService } from 'src/components/Prompt/FillPrompt/fill-prompt.service';
import { ExecuteSimilaritySearchService } from '../ExecuteSimilaritySearch/execute-similarity-search.service';
import { GetRunnableChatService } from '../GetRunnableChat/get-runnable-chat.service';
import { LoadVectorStoreService } from '../LoadVectorStore/load-vector-store.service';

@Module({
  providers: [
    LoadAiChatService,
    FillPromptService,
    GetRunnableChatService,
    LoadVectorStoreService,
    ExecuteSimilaritySearchService,
  ],
})
export class LoadAiChatModule {}
