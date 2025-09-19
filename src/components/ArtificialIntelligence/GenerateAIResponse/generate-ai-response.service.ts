import { IterableReadableStream } from '@langchain/core/dist/utils/stream';
import { AIMessageChunk } from '@langchain/core/messages';
import { Injectable } from '@nestjs/common';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { MessageRepository } from 'src/repositories/message.repository';
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
      const isParser = !!agent.jsonParser;

      const response = await this.generateResponse(
        question,
        metadata,
        agent,
        stream,
        promptVariables,
      );

      if (isParser) {
        const cleanedResponse = (response as string)
          .replace(/```json\s*/, '')
          .replace(/```$/, '')
          .trim();

        let parsed: Record<string, any>;

        try {
          parsed = JSON.parse(cleanedResponse);
        } catch (error) {
          parsed = {};
        }

        return parsed;
      }

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
  ): Promise<string | IterableReadableStream<AIMessageChunk>> {
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
      return iterator;
    }

    const result = await runnable.runnable.invoke(
      templateVariables,
      runnable.config,
    );

    const formattedResponse = result.content.toString();

    await this.messageRepository.create({
      session_id: metadata.session_id,
      message: formattedResponse,
      from: 'agent',
    });

    return formattedResponse;
  }
}
