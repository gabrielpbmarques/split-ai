import { Injectable } from '@nestjs/common';
import { ExecuteSimilaritySearchService } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service';
import { FillPromptService } from 'src/components/ArtificialIntelligence/FillPrompt/fill-prompt.service';
import { GetRunnableChatService } from 'src/components/ArtificialIntelligence/GetRunnableChat/get-runnable-chat.service';
import { LoadVectorStoreService } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service';
import { Agent } from 'src/constants/chats/chats';
import {
  RunnableChat,
  RunnableMessageHistory,
  CustomMetadata,
} from 'src/types';

@Injectable()
export class LoadAiChatService {
  constructor(
    private fillPromptService: FillPromptService,
    private getRunnableChatService: GetRunnableChatService,
    private loadVectorStoreService: LoadVectorStoreService,
    private executeSimilaritySearchService: ExecuteSimilaritySearchService,
  ) {}

  async execute(
    question: string,
    metadata: CustomMetadata,
    sessionId: string,
    agent: Agent,
  ): Promise<RunnableMessageHistory | RunnableChat> {
    const { chat, runnableOpts, jsonParser } = agent;

    const vectorStore = await this.loadVectorStoreService.execute(metadata);
    const retrievedDocuments =
      await this.executeSimilaritySearchService.execute(vectorStore, question);

    const prompt = await this.fillPromptService.execute(
      retrievedDocuments,
      agent,
    );

    return this.getRunnableChatService.execute(
      chat,
      prompt,
      sessionId,
      runnableOpts,
      jsonParser,
    );
  }
}
