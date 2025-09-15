import { Injectable } from '@nestjs/common';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ProcessMessageDataDto } from 'src/components/ArtificialIntelligence/MessageProcessing/ProcessMessageData/process-message-data.dto';
import { agents } from 'src/constants/chats/chats';

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
      promptVariables = {},
    } = processMessageDataDto;

    // Usar o agentId passado como parâmetro
    const typedAgentId = agentId as keyof typeof agents;

    // Chamar o serviço de geração de resposta com as variáveis do prompt
    const parserAiResponse = await this.generateAiResponseService.execute(
      message, // Passamos a mensagem original para compatibilidade
      sessionId,
      {
        agent_id: agentId,
      },
      typedAgentId,
      promptVariables,
    );

    const cleanedResponse = parserAiResponse
      .replace(/```json\s*/, '') // remove ```json e espaços
      .replace(/```$/, '') // remove a última ```
      .trim();

    let parsed: Record<string, any>;

    try {
      parsed = JSON.parse(cleanedResponse);
    } catch (error) {
      parsed = {};
    }

    return parsed;
  }
}
