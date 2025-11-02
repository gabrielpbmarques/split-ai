import { Injectable } from '@nestjs/common';
import { AIMessageChunk } from 'langchain';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { CustomMetadata, ResolvedAgent } from 'src/types';

@Injectable()
export class GenerateAiResponseService {
  constructor(private readonly loadAiChatService: LoadAiChatService) {}

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

    if (stream)
      return runnable.stream(invokeParams, {
        ...configurable,
        streamMode: 'messages',
      });

    return this.returnNonStreamResponse(
      await runnable.invoke(invokeParams, configurable),
    );
  }

  private async returnNonStreamResponse(result: any) {
    const formattedResponse = (result as any).messages
      .at(-1)
      .content.toString();

    return formattedResponse;
  }
}
