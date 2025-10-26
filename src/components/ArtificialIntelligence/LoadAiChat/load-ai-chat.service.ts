import { Injectable } from '@nestjs/common';
import { ExecuteSimilaritySearchService } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service';
import { FillPromptService } from 'src/components/ArtificialIntelligence/FillPrompt/fill-prompt.service';
import { GetRunnableChatService } from 'src/components/ArtificialIntelligence/GetRunnableChat/get-runnable-chat.service';
import { LoadVectorStoreService } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service';
import {
  RunnableChat,
  RunnableMessageHistory,
  CustomMetadata,
  ResolvedAgent,
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
    agent: ResolvedAgent,
  ): Promise<RunnableMessageHistory | RunnableChat> {
    const { chat, runnableOpts, jsonParser } = agent;

    // Carrega informações das fontes de conhecimento da IA
    const documentsVectorStore = await this.loadVectorStoreService.execute(
      {
        source_type: metadata.source_type,
        agent_id: metadata.agent_id,
      },
      'documents',
    );

    // Carrega informações de outras sessões do usuário
    const messagesVectorStore = await this.loadVectorStoreService.execute(
      {
        user_id: metadata.user_id,
        agent_id: metadata.agent_id,
      },
      'messages',
    );

    const retrievedDocuments =
      await this.executeSimilaritySearchService.execute(
        documentsVectorStore,
        question,
      );
    const retrievedMessages = await this.executeSimilaritySearchService.execute(
      messagesVectorStore,
      question,
    );

    const prompt = await this.fillPromptService.execute(
      retrievedDocuments,
      retrievedMessages,
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
