import { Injectable } from '@nestjs/common';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { CreateHistoryService } from '../CreateHistory/create-history.service';
import { RunnableChatOpts } from 'src/types/RunnableChatOpts';
import { RunnableChat } from 'src/types/RunnableChat';
import { CustomRunnable } from 'src/types/CustomRunnable';

@Injectable()
export class GetRunnableChatService {
  constructor(private readonly createHistoryService: CreateHistoryService) {}

  async execute(
    chat: ChatVertexAI,
    prompt: ChatPromptTemplate<any, any>,
    sessionId: string,
    opts: RunnableChatOpts,
  ): Promise<RunnableChat> {
    const runnable = this.getRunnableByOpts(opts, prompt, chat);

    const config: RunnableConfig = {
      configurable: {
        sessionId,
      },
    };

    return { runnable, config };
  }

  private getRunnableByOpts(
    opts: RunnableChatOpts,
    prompt: ChatPromptTemplate<any, any>,
    chat: ChatVertexAI,
  ): CustomRunnable {
    if (!opts.withHistory) return prompt.pipe(chat);

    return new RunnableWithMessageHistory({
      runnable: prompt.pipe(chat),
      getMessageHistory: (sessionId: string) =>
        this.createHistoryService.execute(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history',
    });
  }
}
