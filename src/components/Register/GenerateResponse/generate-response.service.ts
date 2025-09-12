import { Injectable } from '@nestjs/common';
import { GenerateResponseDto } from 'src/components/Register/GenerateResponse/generate-response.dto';
import { GenerateAiResponseService } from 'src/components/AIIntegration/Common/generate-ai-response.service';
import { agents } from 'src/constants/chats/chats';

@Injectable()
export class GenerateResponseService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
  ) {}

  async execute(generateResponseDto: GenerateResponseDto): Promise<string> {
    const {
      message,
      sessionId,
      phoneNumber,
      worker,
      isNewUser,
      processedImage,
      parsedData,
    } = generateResponseDto;

    const registerContext = {
      phone_number: phoneNumber,
      registration_stage: worker?.signupStage || 'personal_info',
      is_new_user: isNewUser,
      user_data: worker,
      processed_image: processedImage,
      parsed_data: parsedData,
    };

    const typedAgentId = 'whatsapp_register' as keyof typeof agents;

    const aiResponse = await this.generateAiResponseService.execute(
      message,
      sessionId,
      {
        agent_id: typedAgentId,
      },
      typedAgentId,
      { registerContext },
    );

    return aiResponse;
  }
}
