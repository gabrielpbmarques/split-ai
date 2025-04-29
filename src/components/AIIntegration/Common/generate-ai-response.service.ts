import { Injectable } from '@nestjs/common';
import { LoadAiChatService } from 'src/components/Langchain/LoadAiChat/load-ai-chat.service';
import { agents } from 'src/constants/chats/chats';
import { CustomMetadata } from 'src/types/CustomMetadata';

@Injectable()
export class GenerateAiResponseService {
  constructor(private loadAiChatService: LoadAiChatService) {}

  async execute(
    question: string,
    sessionId: string,
    metadata: CustomMetadata,
    agentId: keyof typeof agents,
    promptVariables?: any,
  ): Promise<string> {
    try {
      const agent = agents[agentId];

      const runnable = await this.loadAiChatService.execute(
        question,
        metadata,
        sessionId,
        agent,
      );

      // Preparar as variáveis para o template
      // O input é a mensagem do usuário, promptVariables são outras variáveis
      const templateVariables = {
        input: question,
        ...promptVariables, // Outras variáveis para o template, diferentes do input
      };

      // Invocar o runnable com as variáveis do template
      const result = await runnable.runnable.invoke(
        templateVariables,
        runnable.config,
      );

      return result.content.toString();
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }
}
