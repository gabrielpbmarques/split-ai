import { HumanMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Injectable } from '@nestjs/common';
import type { AIMessage } from 'langchain';

import { env } from 'src/shared/config/env';
import {
  AgentFinalResponseSchema,
  type CustomMetadata,
  type ResolvedAgent,
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
    agent: ResolvedAgent,
    stream: boolean = false,
  ): Promise<string | AsyncGenerator<StreamEvent>> {
    try {
      const runnable = agent.runnable;

      const invokeParams = { messages: [new HumanMessage(question)] };

      const threadKey = metadata.conversation_id ?? metadata.session_id;

      const configurable: RunnableConfig = {
        configurable: {
          thread_id: `${agent.organization_id}_${threadKey}`,
        },
        callbacks: this.tracers,
        tags: [env.NODE_ENV, agent.id, metadata.organization_id].filter(
          (tag): tag is string => Boolean(tag),
        ),
        metadata: {
          userId: metadata.user_id,
          sessionId: metadata.session_id,
          environment: env.NODE_ENV,
        },
      };

      if (stream) {
        const streamIterator = await runnable.stream(invokeParams, {
          ...configurable,
          streamMode: 'updates',
        });
        return handleStreamResponse(streamIterator);
      }

      const result = await runnable.invoke(invokeParams, configurable);

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
