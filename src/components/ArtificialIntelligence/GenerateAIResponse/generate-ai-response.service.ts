import { Injectable } from '@nestjs/common';
import { LoadAiChatService } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.service';
import { CustomMetadata } from 'src/types';
import { MessageRepository } from 'src/supabase-repositories/message.repository';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';

@Injectable()
export class GenerateAiResponseService {
  constructor(
    private loadAiChatService: LoadAiChatService,
    private messageRepository: MessageRepository,
    private resolveAgentService: ResolveAgentService,
  ) {}

  async execute(
    question: string,
    metadata: CustomMetadata,
    stream: boolean = false,
    promptVariables?: Record<string, any>,
  ): Promise<string | any> {
    try {
      const agentIdentifier = metadata.agent_id || 'support';
      const agent = await this.resolveAgentService.resolve(agentIdentifier);

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
        return iterator; // AsyncIterable
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
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }
}
