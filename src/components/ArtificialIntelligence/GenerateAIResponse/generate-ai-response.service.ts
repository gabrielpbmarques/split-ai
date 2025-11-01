import { Injectable } from '@nestjs/common';
import { AIMessageChunk } from 'langchain';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { MessageRepository } from 'src/repositories';
import { CustomMetadata, ResolvedAgent } from 'src/types';

@Injectable()
export class GenerateAiResponseService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly loadAiChatService: LoadAiChatService,
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
      console.log(error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }

  private async generateResponse(
    question: string,
    metadata: CustomMetadata,
    agent: ResolvedAgent,
    stream: boolean = false,
  ): Promise<string | AIMessageChunk[] | any> {
    await this.messageRepository.create({
      session_id: metadata.session_id,
      user_id: metadata.user_id,
      agent_id: metadata.agent_id,
      message: question,
      from: 'user',
    });

    const runnable = await this.loadAiChatService.execute(agent);

    const invokeParams = {
      messages: [{ role: 'user', content: question }],
    };

    const configurable = {
      configurable: {
        thread_id: metadata.session_id,
      },
    };

    if (stream) return runnable.stream(invokeParams, configurable);

    return this.returnNonStreamResponse(
      await runnable.invoke(invokeParams, configurable),
      metadata,
    );
  }

  private async returnNonStreamResponse(result: any, metadata: CustomMetadata) {
    console.log(result);
    const formattedResponse = (result as any).messages
      .at(-1)
      .content.toString();

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
