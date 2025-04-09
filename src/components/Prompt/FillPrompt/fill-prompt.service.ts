import { Injectable } from '@nestjs/common';
import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AISourceType } from 'src/types/AISourceType';
import { CustomDocument } from 'src/types/CustomDocument';
import { ChatMessage } from 'src/types/ChatMessage';
import { Agent } from 'src/constants/chats/chats';
import { RegisterContextMetadata } from 'src/types/RegisterContextMetadata';

@Injectable()
export class FillPromptService {
  constructor(private buildSystemPromptService: BuildSystemPromptService) {}

  async execute(
    context: CustomDocument[],
    question: string,
    agent?: Agent,
    contextMetadata?: RegisterContextMetadata | any,
    sources?: AISourceType[],
  ): Promise<ChatPromptTemplate> {
    const {
      instructions,
      runnableOpts: { withHistory },
    } = agent;
    const systemPrompt = this.buildSystemPromptService.execute(
      context,
      instructions,
      contextMetadata,
      sources,
    );

    console.log('System Prompt:', systemPrompt);

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(withHistory ? [new MessagesPlaceholder('history')] : []),
      { role: 'user', content: question },
    ];

    const prompt = ChatPromptTemplate.fromMessages(chatMessages);

    return prompt;
  }
}
