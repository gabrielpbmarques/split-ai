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
      worker,
    } = processMessageDataDto;

    const typedAgentId = 'message_data_parser' as keyof typeof agents;

    let messageWithContext: string = '';

    if (worker) {
      // Usar uma abordagem diferente para evitar problemas com o JSON
      // Converter o worker para uma string base64 para evitar problemas com caracteres especiais
      const workerBase64 = Buffer.from(JSON.stringify(worker)).toString(
        'base64',
      );
      messageWithContext += `[CONTEXTO: Status atual do worker (base64): ${workerBase64}]`;
    }

    if (lastAiResponse) {
      messageWithContext += `[CONTEXTO: A última pergunta da IA foi: "${lastAiResponse.replace('{', '').replace('}', '')}"]`;
    }

    const alreadyHasContent = messageWithContext.length > 0;

    messageWithContext += `${alreadyHasContent ? '\n\n' : ''}Resposta do usuário: "${message}"`;

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

    let parsed: Record<string, any>;

    try {
      parsed = JSON.parse(cleanedResponse);
    } catch (error) {
      parsed = {};
    }

    return parsed;
  }
}
