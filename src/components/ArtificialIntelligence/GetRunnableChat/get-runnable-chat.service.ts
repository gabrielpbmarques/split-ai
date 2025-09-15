import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { Injectable } from '@nestjs/common';
import { CreateHistoryService } from 'src/components/ArtificialIntelligence/CreateHistory/create-history.service';
import { RunnableChatOpts, RunnableChat, CustomRunnable } from 'src/types';

@Injectable()
export class GetRunnableChatService {
  constructor(private readonly createHistoryService: CreateHistoryService) {}

  execute(
    chat: ChatVertexAI,
    prompt: ChatPromptTemplate<any, any>,
    sessionId: string,
    opts: RunnableChatOpts,
    parser?: DynamicStructuredTool<any>,
  ): RunnableChat {
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
    parser?: DynamicStructuredTool<any>,
  ): CustomRunnable {
    if (!opts.withHistory) {
      return parser ? prompt.pipe(chat.bindTools([parser])) : prompt.pipe(chat);
    }

    let runnable: any;
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
