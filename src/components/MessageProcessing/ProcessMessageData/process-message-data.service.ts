import { Injectable } from '@nestjs/common';
import { ProcessMessageDataDto } from 'src/components/MessageProcessing/ProcessMessageData/process-message-data.dto';
import { GenerateAiResponseService } from 'src/components/AIIntegration/Common/generate-ai-response.service';
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

    // Garantir que a mensagem seja incluída nas variáveis do prompt
    const allPromptVariables = {
      message,
      ...promptVariables,
    };

    // Chamar o serviço de geração de resposta com as variáveis do prompt
    const parserAiResponse = await this.generateAiResponseService.execute(
      message, // Passamos a mensagem original para compatibilidade
      sessionId,
      {
        agent_id: agentId,
      },
      typedAgentId,
      allPromptVariables,
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
