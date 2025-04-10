import { Injectable } from '@nestjs/common';
import { ProcessMessageDataDto } from './process-message-data.dto';
import { GenerateAiResponseService } from '../Common/generate-ai-response.service';
import { agents } from '../../../constants/chats/chats';

@Injectable()
export class ProcessMessageDataService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
  ) {}

  async execute(processMessageDataDto: ProcessMessageDataDto): Promise<any> {
    const {
      message,
      sessionId,
      agentId = 'message_data_parser',
      lastAiResponse,
    } = processMessageDataDto;

    // Tipando corretamente o agentId para corresponder às chaves válidas de agents
    const typedAgentId = 'message_data_parser' as keyof typeof agents;

    try {
      // Prepara a mensagem com contexto da última resposta da IA, se disponível
      let messageWithContext = message;

      // Se temos a última resposta da IA, adicionamos como contexto
      if (lastAiResponse) {
        messageWithContext = `[CONTEXTO: A última pergunta da IA foi: "${lastAiResponse}"] \n\nResposta do usuário: "${message}"`;
      }

      // Utiliza o agente de IA para extrair dados estruturados da mensagem
      const parserAiResponse = await this.generateAiResponseService.execute(
        messageWithContext,
        sessionId,
        {
          agent_id: agentId,
        },
        typedAgentId,
      );

      // Limpa a resposta e converte para JSON
      const cleanedResponse = parserAiResponse
        .replace(/```json\s*/, '') // remove ```json e espaços
        .replace(/```$/, '') // remove a última ```
        .trim();

      const parsedData = JSON.parse(cleanedResponse);

      return parsedData;
    } catch (error) {
      console.error('Erro ao processar dados da mensagem:', error);
      return null;
    }
  }
}
