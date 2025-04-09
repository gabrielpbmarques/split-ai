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
    } = processMessageDataDto;

    // Tipando corretamente o agentId para corresponder às chaves válidas de agents
    const typedAgentId = 'message_data_parser' as keyof typeof agents;

    try {
      // Utiliza o agente de IA para extrair dados estruturados da mensagem
      const parserAiResponse = await this.generateAiResponseService.execute(
        message,
        sessionId,
        {
          agent_id: agentId,
        },
        typedAgentId,
      );

      console.log('Parser AI Response:', parserAiResponse);

      // Limpa a resposta e converte para JSON
      const cleanedResponse = parserAiResponse
        .replace(/```json\s*/, '') // remove ```json e espaços
        .replace(/```$/, '') // remove a última ```
        .trim();

      const parsedData = JSON.parse(cleanedResponse);
      console.log('Parsed Data:', parsedData);

      return parsedData;
    } catch (error) {
      console.error('Erro ao processar dados da mensagem:', error);
      return null;
    }
  }
}
