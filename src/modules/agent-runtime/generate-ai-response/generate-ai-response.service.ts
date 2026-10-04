import { HumanMessage } from '@langchain/core/messages';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Injectable } from '@nestjs/common';
import { AIMessage } from 'langchain';

import { env } from 'src/shared/config/env';
import {
  AgentFinalResponseSchema,
  CustomMetadata,
  ResolvedAgent,
  StreamEvent,
} from 'src/shared/contracts';
import { InvokeConfigurationModel } from 'src/shared/contracts/models/invoke-configuration.model';
import { errorStream } from 'src/shared/utils/error-stream';
import { handleStreamResponse } from 'src/shared/utils/handle-stream-response';
import { textOf } from 'src/shared/utils/text-of';

@Injectable()
export class GenerateAiResponseService {
  private tracer: LangChainTracer;

  constructor() {
    this.tracer = new LangChainTracer({ projectName: env.LANGCHAIN_PROJECT });
  }

  async execute(
    question: string,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
    stream: boolean = false,
  ): Promise<string | AsyncGenerator<StreamEvent> | any> {
    try {
      const runnable = agent.runnable;

      const invokeParams = {
        messages: [new HumanMessage(question)],
      } as any;

      const threadKey = metadata.conversation_id ?? metadata.session_id;

      const configurable: InvokeConfigurationModel = {
        configurable: {
          thread_id: `${agent.organization_id}_${threadKey}`,
        },
        callbacks: [this.tracer],
        tags: [env.NODE_ENV, agent.id, metadata.organization_id],
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
    } catch (error: any) {
      const message =
        'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';

      if (stream) {
        return errorStream(message);
      }

      return message;
    }
  }
}
