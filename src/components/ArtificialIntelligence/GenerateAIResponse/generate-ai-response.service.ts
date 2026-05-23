import { HumanMessage, UsageMetadata } from '@langchain/core/messages';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Injectable } from '@nestjs/common';
import { AIMessage, AIMessageChunk } from 'langchain';
import { config } from 'src/config';
import {
  AgentFinalResponseSchema,
  CustomMetadata,
  ResolvedAgent,
} from 'src/types';
import { InvokeConfigurationModel } from 'src/types/models/invoke-configuration.model';

import { RecordTokenUsageService } from '../../TokenUsage/RecordTokenUsage/record-token-usage.service';

@Injectable()
export class GenerateAiResponseService {
  private tracer: LangChainTracer;

  constructor(
    private readonly recordTokenUsageService: RecordTokenUsageService,
  ) {
    this.tracer = new LangChainTracer({ projectName: config.langchainProject });
  }

  async execute(
    question: string,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
    stream: boolean = false,
  ): Promise<string | AIMessageChunk[] | any> {
    try {
      const response = await this.generateResponse(
        question,
        metadata,
        agent,
        stream,
      );

      return response;
    } catch (error) {
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }

  private async generateResponse(
    question: string,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
    stream: boolean = false,
  ): Promise<string | AIMessageChunk[] | any> {
    const runnable = agent.runnable;

    // NOTE: `createAgent`'s inferred Invoke input type can become overly strict
    // depending on generic inference. Runtime accepts `{ messages: BaseMessage[] }`.
    const invokeParams = {
      messages: [new HumanMessage(question)],
    } as any;

    const configurable: InvokeConfigurationModel = {
      configurable: {
        thread_id: `${agent.organization_id}_${metadata.session_id}`,
      },
      callbacks: [this.tracer],
      tags: [config.env, agent.id, metadata.organization_id],
      metadata: {
        userId: metadata.user_id,
        sessionId: metadata.session_id,
        environment: config.env,
      },
    };

    if (stream) {
      const streamIterator = await runnable.stream(invokeParams, {
        ...configurable,
        streamMode: 'updates',
      });
      return this.handleStreamResponse(streamIterator, metadata, agent);
    }

    const result = await runnable.invoke(invokeParams, configurable);

    const usageMetadata = (result?.messages?.at(-1) as AIMessage)
      .usage_metadata as UsageMetadata;

    if (usageMetadata && agent.organization_id) {
      await this.recordTokenUsageService.execute({
        organization_id: agent.organization_id,
        agent_id: agent.id,
        user_id: metadata.user_id,
        input_tokens: usageMetadata?.input_tokens ?? 0,
        output_tokens: usageMetadata?.output_tokens ?? 0,
        total_tokens: usageMetadata?.total_tokens ?? 0,
        model: (agent.chat as any).model || 'unknown',
      });
    }

    const structured = AgentFinalResponseSchema.parse(
      result.structuredResponse,
    );

    return structured.finalAnswer;
  }

  private async *handleStreamResponse(
    stream: AsyncGenerator<any>,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
  ) {
    // LangChain v1's `createAgent` names the LLM node "model_request" and
    // emits both new messages and the `structuredResponse` from that node
    // (see node_modules/langchain/dist/agents/nodes/AgentNode.js).
    const recordedUsageIds = new Set<string>();
    for await (const chunk of stream) {
      const update = chunk?.model_request;
      if (!update) continue;

      if (update.messages?.length) {
        for (const message of update.messages) {
          if (
            message?.usage_metadata &&
            agent.organization_id &&
            !(message.id && recordedUsageIds.has(message.id))
          ) {
            if (message.id) recordedUsageIds.add(message.id);
            await this.recordTokenUsageService.execute({
              organization_id: agent.organization_id,
              agent_id: agent.id,
              user_id: metadata.user_id,
              input_tokens: message.usage_metadata?.input_tokens ?? 0,
              output_tokens: message.usage_metadata?.output_tokens ?? 0,
              total_tokens: message.usage_metadata?.total_tokens ?? 0,
              model: (agent.chat as any).model || 'unknown',
            });
          }
        }
      }

      if (update.structuredResponse?.finalAnswer) {
        yield update.structuredResponse.finalAnswer;
      }
    }
  }
}
