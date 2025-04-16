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

    const typedAgentId = 'message_data_parser' as keyof typeof agents;

    let messageWithContext = message;

    if (lastAiResponse) {
      messageWithContext = `[CONTEXTO: A última pergunta da IA foi: "${lastAiResponse.replace('{', '').replace('}', '')}"] \n\nResposta do usuário: "${message}"`;
    }

    const parserAiResponse = await this.generateAiResponseService.execute(
      messageWithContext,
      sessionId,
      {
        agent_id: agentId,
      },
      typedAgentId,
    );

    const cleanedResponse = parserAiResponse
      .replace(/```json\s*/, '') // remove ```json e espaços
      .replace(/```$/, '') // remove a última ```
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    return parsed;
  }
}
