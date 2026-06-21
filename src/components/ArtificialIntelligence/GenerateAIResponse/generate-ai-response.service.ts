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
  tool_calls?: Array<{ name?: string }>;
};

type StreamChunk = {
  // LangChain v1's `createAgent` names the LLM node "model_request" and emits
  // both the new messages and any `structuredResponse` update from that same
  // node (see node_modules/langchain/dist/agents/nodes/AgentNode.js).
  model_request?: {
    messages?: AgentMessage[];
    structuredResponse?: { finalAnswer?: string };
  };
  tools?: { messages?: Array<{ name?: string; content?: unknown }> };
};

function extractTextContent(content: unknown): string | null {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (typeof part === 'string') parts.push(part);
      else if (part && typeof part === 'object') {
        const p = part as { text?: unknown };
        if (typeof p.text === 'string') parts.push(p.text);
      }
    }
    return parts.length > 0 ? parts.join('') : null;
  }
  return null;
}

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
    let lastAgentContent: string | null = null;

    try {
      for await (const raw of stream as AsyncIterable<StreamChunk>) {
        const chunk = raw ?? {};

        if (chunk.model_request) {
          const update = chunk.model_request;
          if (update.messages?.length) {
            for (const message of update.messages) {
              if (
                message?.usage_metadata &&
                agent.organization_id &&
                !(message.id && recordedUsageIds.has(message.id))
              ) {
                if (message.id) recordedUsageIds.add(message.id);
                await this.recordTokenUsageService
                  .execute({
                    organization_id: agent.organization_id,
                    agent_id: agent.id,
                    user_id: metadata.user_id,
                    input_tokens: message.usage_metadata?.input_tokens ?? 0,
                    output_tokens: message.usage_metadata?.output_tokens ?? 0,
                    total_tokens: message.usage_metadata?.total_tokens ?? 0,
                    model: (agent.chat as any).model || 'unknown',
                  })
                  .catch(() => {
                    /* token recording must not break the stream */
                  });
              }

              if (message?.tool_calls?.length) {
                for (const call of message.tool_calls) {
                  if (call?.name) {
                    yield {
                      type: 'status',
                      phase: 'tool_call',
                      tool: call.name,
                    };
                  }
                }
              } else {
                const text = extractTextContent(message?.content);
                if (text && text.trim().length > 0) {
                  lastAgentContent = text;
                  yield { type: 'content', delta: text };
                }
              }
            }
          }

          if (update.structuredResponse?.finalAnswer) {
            finalEmitted = true;
            yield {
              type: 'final',
              text: update.structuredResponse.finalAnswer,
            };
          }
          continue;
        }

        if (chunk.tools?.messages?.length) {
          for (const toolMsg of chunk.tools.messages) {
            if (toolMsg?.name) {
              yield {
                type: 'status',
                phase: 'tool_result',
                tool: toolMsg.name,
              };
            }
          }
          continue;
        }
      }

      if (!finalEmitted && lastAgentContent) {
        yield { type: 'final', text: lastAgentContent };
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Erro inesperado';
      const message = /recursion limit/i.test(raw)
        ? 'O agente explorou bastante mas não conseguiu consolidar uma resposta. Tente reformular com escopo mais específico.'
        : raw;
      yield { type: 'error', message };
    } finally {
      yield { type: 'done' };
    }
  }
}
