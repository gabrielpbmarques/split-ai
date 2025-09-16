import { Injectable } from '@nestjs/common';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ProcessMessageDataDto } from 'src/components/ArtificialIntelligence/MessageProcessing/ProcessMessageData/process-message-data.dto';

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
    const parserAiResponse = await this.generateAiResponseService.execute(
      message,
      {
        agent_id: agentId,
        session_id: sessionId,
      },
      false,
      promptVariables,
    );

    const cleanedResponse = parserAiResponse
      .replace(/```json\s*/, '')
      .replace(/```$/, '')
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
