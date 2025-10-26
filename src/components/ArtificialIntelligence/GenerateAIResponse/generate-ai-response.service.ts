import { IterableReadableStream } from '@langchain/core/dist/utils/stream';
import { AIMessageChunk } from '@langchain/core/messages';
import { Injectable } from '@nestjs/common';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { MessageRepository } from 'src/repositories';
import { CustomMetadata, ResolvedAgent } from 'src/types';

@Injectable()
export class GenerateAiResponseService {
  constructor(
    private readonly loadAiChatService: LoadAiChatService,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(
    question: string,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
    stream: boolean = false,
    promptVariables?: Record<string, any>,
  ): Promise<string | IterableReadableStream<AIMessageChunk> | any> {
    try {
      const response = await this.generateResponse(
        question,
        metadata,
        agent,
        stream,
        promptVariables,
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
    promptVariables?: Record<string, any>,
  ): Promise<string | IterableReadableStream<AIMessageChunk> | any> {
    await this.messageRepository.create({
      session_id: metadata.session_id,
      user_id: metadata.user_id,
      agent_id: metadata.agent_id,
      message: question,
      from: 'user',
    });

    const runnable = await this.loadAiChatService.execute(
      question,
      {
        ...metadata,
        agent_id: agent.id,
        user_id: metadata.user_id,
      },
      metadata.session_id,
      agent,
    );

    const templateVariables = {
      input: question,
      ...promptVariables,
    };

    if (stream)
      return this.returnStreamResponse(
        await runnable.runnable.stream(templateVariables, runnable.config),
      );

    return this.returnNonStreamResponse(
      await runnable.runnable.invoke(templateVariables, runnable.config),
      metadata,
    );
  }

  private async returnStreamResponse(
    iterator: AsyncIterableIterator<AIMessageChunk>,
  ) {
    const first = await iterator.next();
    if (!first.done) {
      const firstVal: any = first.value as any;
      if (Array.isArray(firstVal.tool_calls) && firstVal.tool_calls.length) {
        const args = firstVal.tool_calls[0].args;
        return args;
      }
      async function* reStream() {
        yield first.value as AIMessageChunk;
        for await (const c of iterator as any) {
          yield c as AIMessageChunk;
        }
      }
      return reStream();
    }
    return iterator;
  }

  private async returnNonStreamResponse(result: any, metadata: CustomMetadata) {
    if (
      Array.isArray((result as any).tool_calls) &&
      (result as any).tool_calls.length
    ) {
      const args = (result as any).tool_calls[0].args;
      return args;
    }

    const formattedResponse = result.content.toString();

    await this.messageRepository.create({
      session_id: metadata.session_id,
      user_id: metadata.user_id,
      agent_id: metadata.agent_id,
      message: formattedResponse,
      from: 'agent',
    });

    return formattedResponse;
  }
}
