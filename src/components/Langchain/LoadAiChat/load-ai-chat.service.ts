import { Injectable } from '@nestjs/common';
import { FillPromptService } from 'src/components/Prompt/FillPrompt/fill-prompt.service';
import { RunnableChat } from 'src/types/RunnableChat';
import { RunnableMessageHistory } from 'src/types/RunnableMessageHistory';
import { GetRunnableChatService } from 'src/components/Langchain/GetRunnableChat/get-runnable-chat.service';
import { LoadVectorStoreService } from 'src/components/Langchain/LoadVectorStore/load-vector-store.service';
import { ExecuteSimilaritySearchService } from 'src/components/Langchain/ExecuteSimilaritySearch/execute-similarity-search.service';
import { Agent } from 'src/constants/chats/chats';
import { CustomMetadata } from 'src/types/CustomMetadata';

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
