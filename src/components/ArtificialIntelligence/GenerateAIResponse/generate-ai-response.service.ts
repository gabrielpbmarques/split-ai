import { Injectable } from '@nestjs/common';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { agents } from 'src/constants/chats/chats';
import { CustomMetadata } from 'src/types';
import { MessageRepository } from 'src/supabase-repositories/message.repository';

@Injectable()
export class GenerateAiResponseService {
  constructor(
    private loadAiChatService: LoadAiChatService,
    private messageRepository: MessageRepository,
  ) {}

  async execute(
    question: string,
    sessionId: string,
    metadata: CustomMetadata,
    agentId: keyof typeof agents,
    promptVariables?: Record<string, any>,
    userId?: string,
  ): Promise<string | any> {
    try {
      const agent = agents[agentId];

      await this.messageRepository.create({
        session_id: sessionId,
        message: question,
        from: 'user',
      });

      const runnable = await this.loadAiChatService.execute(
        question,
        metadata,
        sessionId,
        agent,
      );

      const templateVariables = {
        input: question,
        ...promptVariables,
      };

      const result = await runnable.runnable.invoke(
        templateVariables,
        runnable.config,
      );

      if (
        agent.jsonParser &&
        result.tool_calls &&
        result.tool_calls.length > 0
      ) {
        return result.tool_calls[0].args;
      }

      const formattedResponse = result.content.toString();

      await this.messageRepository.create({
        session_id: sessionId,
        message: formattedResponse,
        from: 'agent',
      });

      return formattedResponse;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }
}
