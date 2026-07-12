import { HumanMessage, UsageMetadata } from '@langchain/core/messages';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Injectable } from '@nestjs/common';
import { AIMessage } from 'langchain';
import { config } from 'src/config';
import {
  AgentFinalResponseSchema,
  CustomMetadata,
  ResolvedAgent,
  StreamEvent,
} from 'src/types';
import { InvokeConfigurationModel } from 'src/types/models/invoke-configuration.model';

import { RecordTokenUsageService } from '../../TokenUsage/RecordTokenUsage/record-token-usage.service';

type AgentMessage = {
  id?: string;
  content?: unknown;
  usage_metadata?: UsageMetadata;
  tool_calls?: Array<{ name?: string; args?: { finalAnswer?: unknown } }>;
};

const isStructuredOutputTool = (name?: string): boolean =>
  !!name && /^extract(-\d+)?$/.test(name);

type StreamChunk = {
  model_request?: {
    messages?: AgentMessage[];
    structuredResponse?: { finalAnswer?: string };
  };
  tools?: { messages?: Array<{ name?: string; content?: unknown }> };
};

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
  ): Promise<string | AsyncGenerator<StreamEvent> | any> {
    try {
      const response = await this.generateResponse(
        question,
        metadata,
        agent,
        stream,
      );

      return response;
    } catch (error: any) {
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }

  private async generateResponse(
    question: string,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
    stream: boolean = false,
  ): Promise<string | AsyncGenerator<StreamEvent> | any> {
    const runnable = agent.runnable;

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
  ): AsyncGenerator<StreamEvent> {
    const recordedUsageIds = new Set<string>();
    let finalEmitted = false;
    let pendingFinal: string | undefined;

    try {
      for await (const raw of stream as AsyncIterable<StreamChunk>) {
        const modelRequest = raw?.model_request;
        const toolMessages = raw?.tools?.messages;

        if (modelRequest) {
          for (const message of modelRequest.messages ?? []) {
            this.recordTokenUsage(message, agent, metadata, recordedUsageIds);

            for (const call of message.tool_calls ?? []) {
              if (isStructuredOutputTool(call?.name)) {
                const raw = call?.args?.finalAnswer;
                if (typeof raw === 'string' && raw.trim()) pendingFinal = raw;
                continue; // internal extractor — never a user-facing tool chip
              }
              if (call?.name) {
                yield { type: 'status', phase: 'tool_call', tool: call.name };
              }
            }
          }

          const finalAnswer = modelRequest.structuredResponse?.finalAnswer;
          if (finalAnswer && !finalEmitted) {
            finalEmitted = true;
            yield { type: 'final', text: finalAnswer };
          }
        } else if (toolMessages?.length) {
          for (const toolMsg of toolMessages) {
            if (toolMsg?.name && !isStructuredOutputTool(toolMsg.name)) {
              yield {
                type: 'status',
                phase: 'tool_result',
                tool: toolMsg.name,
              };
            }
          }
        }
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Erro inesperado';
      const message = /recursion limit/i.test(raw)
        ? 'O agente explorou bastante mas não conseguiu consolidar uma resposta. Tente reformular com escopo mais específico.'
        : raw;
      yield { type: 'error', message };
    } finally {
      if (!finalEmitted && pendingFinal) {
        yield { type: 'final', text: pendingFinal };
      }
      yield { type: 'done' };
    }
  }

  private recordTokenUsage(
    message: AgentMessage,
    agent: ResolvedAgent,
    metadata: CustomMetadata,
    recordedUsageIds: Set<string>,
  ): void {
    if (!message?.usage_metadata || !agent.organization_id) return;
    if (message.id && recordedUsageIds.has(message.id)) return;
    if (message.id) recordedUsageIds.add(message.id);

    void this.recordTokenUsageService
      .execute({
        organization_id: agent.organization_id,
        agent_id: agent.id,
        user_id: metadata.user_id,
        input_tokens: message.usage_metadata.input_tokens ?? 0,
        output_tokens: message.usage_metadata.output_tokens ?? 0,
        total_tokens: message.usage_metadata.total_tokens ?? 0,
        model: (agent.chat as any).model || 'unknown',
      })
      .catch(() => {
        /* token recording must not break the stream */
      });
  }
}
