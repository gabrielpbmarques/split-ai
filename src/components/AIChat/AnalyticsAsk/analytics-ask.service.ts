import { HumanMessage, UsageMetadata } from '@langchain/core/messages';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Injectable } from '@nestjs/common';
import { ANALYTICS_ORACLE_IDENTIFIER } from 'src/components/ArtificialIntelligence/LoadAnalyticsTools/load-analytics-tools.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { RecordTokenUsageService } from 'src/components/TokenUsage/RecordTokenUsage/record-token-usage.service';
import { config } from 'src/config';

import { AnalyticsAskDto } from './analytics-ask.dto';

type StreamEvent =
  | { type: 'status'; phase: 'tool_call' | 'tool_result'; tool: string }
  | { type: 'final'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

type AgentMessage = {
  content?: unknown;
  usage_metadata?: UsageMetadata;
  tool_calls?: Array<{ name?: string }>;
};

function extractTextContent(content: unknown): string | null {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (typeof part === 'string') parts.push(part);
      else if (part && typeof part === 'object') {
        const p = part as { text?: unknown; type?: unknown };
        if (typeof p.text === 'string') parts.push(p.text);
      }
    }
    return parts.length > 0 ? parts.join('') : null;
  }
  return null;
}

type StreamChunk = {
  agent?: { messages?: AgentMessage[] };
  tools?: { messages?: Array<{ name?: string }> };
  model?: { structuredResponse?: { finalAnswer?: string } };
};

@Injectable()
export class AnalyticsAskService {
  private readonly tracer: LangChainTracer;

  constructor(
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordTokenUsageService: RecordTokenUsageService,
  ) {
    this.tracer = new LangChainTracer({ projectName: config.langchainProject });
  }

  async execute(
    dto: AnalyticsAskDto,
    onEvent: (event: StreamEvent) => void,
  ): Promise<void> {
    const agentIdentifier = dto.agentIdentifier ?? ANALYTICS_ORACLE_IDENTIFIER;
    const threadId = `analytics_${dto.companyId}_${dto.conversationId}`;

    let agent;
    try {
      agent = await this.resolveAgentService.execute(agentIdentifier, {
        companyId: dto.companyId,
        threadId,
        conversationId: dto.conversationId,
        sessionId: threadId,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao carregar agente';
      onEvent({ type: 'error', message });
      onEvent({ type: 'done' });
      return;
    }

    const orgIdForTags =
      agent.organization_id ?? `analytics-company-${dto.companyId}`;

    const invokeParams = {
      messages: [new HumanMessage(dto.question)],
    } as any;

    // Default LangGraph recursionLimit is 25 — too tight for an analytics
    // agent that may explore schema, describe several tables, validate, and
    // execute multiple queries in a single turn. 75 ≈ 25+ tool calls before
    // we give up. Bump via env if needed without redeploying code changes.
    const recursionLimit = Number(process.env.ORACLE_RECURSION_LIMIT) || 75;

    const configurable = {
      configurable: { thread_id: threadId },
      callbacks: [this.tracer],
      tags: [config.env ?? 'unknown', agent.id ?? 'unknown', orgIdForTags],
      metadata: {
        userId: `company-${dto.companyId}`,
        sessionId: threadId,
        environment: config.env,
        companyId: dto.companyId,
        conversationId: dto.conversationId,
      },
      streamMode: 'updates' as const,
      recursionLimit,
    };

    let finalEmitted = false;
    // Fallback: when `responseFormat` parsing doesn't surface a
    // `structuredResponse` chunk (which happens often with createAgent),
    // we use the last `agent` message that has content and no tool_calls.
    let lastAgentContent: string | null = null;

    try {
      const stream = await agent.runnable.stream(invokeParams, configurable);
      for await (const raw of stream as AsyncIterable<StreamChunk>) {
        const chunk = raw ?? {};

        if (chunk.agent?.messages?.length) {
          for (const message of chunk.agent.messages) {
            if (message?.usage_metadata && agent.organization_id) {
              await this.recordTokenUsageService
                .execute({
                  organization_id: agent.organization_id,
                  agent_id: agent.id,
                  user_id: `company-${dto.companyId}`,
                  input_tokens: message.usage_metadata.input_tokens ?? 0,
                  output_tokens: message.usage_metadata.output_tokens ?? 0,
                  total_tokens: message.usage_metadata.total_tokens ?? 0,
                  model: (agent.chat as any).model || 'unknown',
                } as any)
                .catch(() => {});
            }
            if (message?.tool_calls?.length) {
              for (const call of message.tool_calls) {
                if (call?.name) {
                  onEvent({
                    type: 'status',
                    phase: 'tool_call',
                    tool: call.name,
                  });
                }
              }
            } else {
              const text = extractTextContent(message?.content);
              if (text && text.trim().length > 0) {
                lastAgentContent = text;
              }
            }
          }
          continue;
        }

        if (chunk.tools?.messages?.length) {
          for (const toolMsg of chunk.tools.messages) {
            if (toolMsg?.name) {
              onEvent({
                type: 'status',
                phase: 'tool_result',
                tool: toolMsg.name,
              });
            }
          }
          continue;
        }

        if (chunk.model?.structuredResponse?.finalAnswer) {
          finalEmitted = true;
          onEvent({
            type: 'final',
            text: chunk.model.structuredResponse.finalAnswer,
          });
        }
      }

      if (!finalEmitted && lastAgentContent) {
        finalEmitted = true;
        onEvent({ type: 'final', text: lastAgentContent });
      }

      if (!finalEmitted) {
        onEvent({
          type: 'error',
          message:
            'O agente não produziu uma resposta final. Tente reformular a pergunta.',
        });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Erro inesperado';
      const message = /recursion limit/i.test(raw)
        ? 'O oráculo explorou bastante mas não conseguiu consolidar uma resposta. Tente reformular com escopo mais específico (nomeie a campanha, período ou métrica desejada).'
        : raw;
      onEvent({ type: 'error', message });
    } finally {
      onEvent({ type: 'done' });
    }
  }
}
