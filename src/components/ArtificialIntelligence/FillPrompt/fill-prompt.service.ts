import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { Injectable } from '@nestjs/common';
import { BuildSystemPromptService } from 'src/components/ArtificialIntelligence/BuildSystemPrompt/build-system-prompt.service';
import { Agent } from 'src/constants/chats/chats';
import { AISourceType, CustomDocument, ChatMessage } from 'src/types';

@Injectable()
export class FillPromptService {
  constructor(private buildSystemPromptService: BuildSystemPromptService) {}

  async execute(
    context: CustomDocument[],
    agent?: Agent,
    sources?: AISourceType[],
  ): Promise<ChatPromptTemplate> {
    const {
      instructions,
      runnableOpts: { withHistory },
    } = agent!;
    const systemPrompt = this.buildSystemPromptService.execute(
      context,
      instructions,
      sources,
    );

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(withHistory ? [new MessagesPlaceholder('history')] : []),
      { role: 'user', content: '{input}' },
    ];

    const prompt = ChatPromptTemplate.fromMessages(chatMessages);

    return prompt;
  }
}
