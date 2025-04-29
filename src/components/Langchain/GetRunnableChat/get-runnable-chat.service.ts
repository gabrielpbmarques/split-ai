import { Injectable } from '@nestjs/common';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { CreateHistoryService } from 'src/components/Langchain/CreateHistory/create-history.service';
import { RunnableChatOpts } from 'src/types/RunnableChatOpts';
import { RunnableChat } from 'src/types/RunnableChat';
import { CustomRunnable } from 'src/types/CustomRunnable';
import { DynamicStructuredTool } from 'langchain/dist/tools';
import { z } from 'zod';

@Injectable()
export class GetRunnableChatService {
  constructor(private readonly createHistoryService: CreateHistoryService) {}

  async execute(
    chat: ChatVertexAI,
    prompt: ChatPromptTemplate<any, any>,
    sessionId: string,
    opts: RunnableChatOpts,
    parser?: DynamicStructuredTool<z.ZodObject<any>>,
  ): Promise<RunnableChat> {
    const runnable = this.getRunnableByOpts(opts, prompt, chat, parser);

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
    parser?: DynamicStructuredTool<z.ZodObject<any>>,
  ): CustomRunnable {
    if (!opts.withHistory) {
      return parser ? prompt.pipe(chat.bindTools([parser])) : prompt.pipe(chat);
    }

    let runnable;
    if (parser) {
      const chatWithTools = chat.bindTools([parser]);
      runnable = prompt.pipe(chatWithTools);
    } else {
      runnable = prompt.pipe(chat);
    }

    return new RunnableWithMessageHistory({
      runnable,
      getMessageHistory: (sessionId: string) =>
        this.createHistoryService.execute(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history',
    });
  }
}
