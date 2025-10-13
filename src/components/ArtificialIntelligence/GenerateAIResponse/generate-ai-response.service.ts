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
      message: question,
      from: 'user',
    });

    const runnable = await this.loadAiChatService.execute(
      question,
      {
        ...metadata,
        agent_id: agent.id,
      },
      metadata.session_id,
      agent,
    );

    const templateVariables = {
      input: question,
      ...promptVariables,
    };

    if (stream) {
      const iterator = await runnable.runnable.stream(
        templateVariables,
        runnable.config,
      );

      const first = await iterator.next();
      if (!first.done) {
        const firstVal: any = first.value as any;
        if (Array.isArray(firstVal.tool_calls) && firstVal.tool_calls.length) {
          return firstVal.tool_calls[0].args;
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

    const result = await runnable.runnable.invoke(
      templateVariables,
      runnable.config,
    );

    console.log(result);

    if (
      Array.isArray((result as any).tool_calls) &&
      (result as any).tool_calls.length
    ) {
      return (result as any).tool_calls[0].args;
    }

    const formattedResponse = result.content.toString();

    await this.messageRepository.create({
      session_id: metadata.session_id,
      message: formattedResponse,
      from: 'agent',
    });

    return formattedResponse;
  }
}
