import { Injectable } from '@nestjs/common';
import { LoadAiChatService } from '../../Langchain/LoadAiChat/load-ai-chat.service';
import { agents } from 'src/constants/chats/chats';
import { CustomMetadata } from 'src/types/CustomMetadata';

@Injectable()
export class GenerateAiResponseService {
  constructor(private loadAiChatService: LoadAiChatService) {}

  async execute(
    question: string,
    sessionId: string,
    metadata: CustomMetadata,
  ): Promise<string> {
    try {
      const agent = agents.register_chat;
      const runnable = await this.loadAiChatService.execute(
        question,
        metadata,
        sessionId,
        agent,
      );

      const result = await runnable.runnable.invoke(
        {
          input: question,
        },
        runnable.config,
      );

      return result.content.toString();
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }
}
