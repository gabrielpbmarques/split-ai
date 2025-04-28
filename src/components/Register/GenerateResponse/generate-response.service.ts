import { Injectable } from '@nestjs/common';
import { GenerateResponseDto } from './generate-response.dto';
import { GenerateAiResponseService } from '../../AIIntegration/Common/generate-ai-response.service';
import { agents } from '../../../constants/chats/chats';

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
      invalidFields,
      isConfirmation,
    } = generateResponseDto;

    // Criar o objeto de contexto de registro
    const registerContext = {
      phone_number: phoneNumber,
      registration_stage: worker?.signupStage || 'personal_info',
      is_new_user: isNewUser,
      user_data: worker,
      processed_image: processedImage,
      invalid_fields: invalidFields,
      fields_to_update: worker?.fieldsToUpdate || [],
      is_confirmation: isConfirmation || false,
    };

    // Passar o objeto de contexto como uma única variável
    const promptVariables = {
      registerContext,
    };

    const typedAgentId = 'whatsapp_register' as keyof typeof agents;

    const aiResponse = await this.generateAiResponseService.execute(
      message,
      sessionId,
      {
        agent_id: typedAgentId,
      },
      typedAgentId,
      promptVariables,
    );

    return aiResponse;
  }
}
