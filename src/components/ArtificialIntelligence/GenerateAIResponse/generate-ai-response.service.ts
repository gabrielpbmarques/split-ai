import { UsageMetadata } from '@langchain/core/messages';
import { Injectable } from '@nestjs/common';
import { AIMessage, AIMessageChunk } from 'langchain';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { CustomMetadata, ResolvedAgent } from 'src/types';

import { RecordTokenUsageService } from '../../TokenUsage/RecordTokenUsage/record-token-usage.service';

@Injectable()
export class GenerateAiResponseService {
  constructor(
    private readonly loadAiChatService: LoadAiChatService,
    private readonly recordTokenUsageService: RecordTokenUsageService,
  ) {}

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
    const runnable = await this.loadAiChatService.execute(agent);

    const invokeParams = {
      messages: [{ role: 'user', content: question }],
    };

    const configurable = {
      configurable: {
        thread_id: metadata.session_id,
      },
    };

    if (stream) {
      const streamIterator = await runnable.stream(invokeParams, {
        ...configurable,
        streamMode: 'messages',
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

    return this.returnNonStreamResponse(result);
  }

  private async *handleStreamResponse(
    stream: AsyncGenerator<AIMessage> | any,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
  ) {
    for await (const chunk of stream) {
      if (chunk.usage_metadata && agent.organization_id) {
        this.recordTokenUsageService.execute({
          organization_id: agent.organization_id,
          agent_id: agent.id,
          user_id: metadata.user_id,
          input_tokens: chunk.usage_metadata?.input_tokens ?? 0,
          output_tokens: chunk.usage_metadata?.output_tokens ?? 0,
          total_tokens: chunk.usage_metadata?.total_tokens ?? 0,
          model: (agent.chat as any).model || 'unknown',
        });
      }
      yield chunk;
    }
  }

  private async returnNonStreamResponse(result: any) {
    const formattedResponse = (result as any).messages
      .at(-1)
      .content.toString();

    return formattedResponse;
  }
}
