import { HumanMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Injectable } from '@nestjs/common';
import type { DeepAgent } from 'deepagents';
import type { AIMessage } from 'langchain';

import { env } from 'src/shared/config/env';
import {
  AgentFinalResponseSchema,
  type CustomMetadata,
  type StreamEvent,
} from 'src/shared/contracts';
import { errorStream } from 'src/shared/utils/error-stream';
import { handleStreamResponse } from 'src/shared/utils/handle-stream-response';
import { textOf } from 'src/shared/utils/text-of';

@Injectable()
export class GenerateAiResponseService {
  private readonly tracers: LangChainTracer[];

  constructor() {
    this.tracers =
      env.INTEGRATION_MODE === 'mock'
        ? []
        : [new LangChainTracer({ projectName: env.LANGCHAIN_PROJECT })];
  }

  async execute(
    question: string,
    metadata: CustomMetadata,
    agent: DeepAgent,
    stream: boolean = false,
  ): Promise<string | AsyncGenerator<StreamEvent>> {
    try {
      const invokeParams = { messages: [new HumanMessage(question)] };

      const threadKey = metadata.conversation_id ?? metadata.session_id;

      const configurable: RunnableConfig = {
        configurable: {
          thread_id: threadKey,
        },
        callbacks: this.tracers,
        metadata: {
          userId: metadata.user_id,
          sessionId: metadata.session_id,
          environment: env.NODE_ENV,
        },
      };

      if (stream) {
        const streamIterator = await agent.stream(invokeParams, {
          ...configurable,
          streamMode: 'updates',
        });
        return handleStreamResponse(streamIterator);
      }

      const result = await agent.invoke(invokeParams, configurable);

      const structured = AgentFinalResponseSchema.safeParse(
        result.structuredResponse,
      );

      if (structured.success) return structured.data.finalAnswer;

      return textOf((result?.messages?.at(-1) as AIMessage)?.content);
    } catch {
      const message =
        'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';

      if (stream) {
        return errorStream(message);
      }

      return message;
    }
  }
}
