import { Injectable } from '@nestjs/common';
import { GenerateResponseDto } from './generate-response.dto';
import { GenerateAiResponseService } from '../Common/generate-ai-response.service';
import { RegisterContextMetadata } from '../../../types/RegisterContextMetadata';
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
    } = generateResponseDto;

    const registerMetadata: RegisterContextMetadata = {
      phone_number: phoneNumber,
      registration_stage: worker?.signupStage || 'personal_info',
      is_new_user: isNewUser,
      user_data: worker,
      processed_image: processedImage || null,
      invalid_fields: invalidFields || null,
      fields_to_update: worker?.fieldsToUpdate || [],
    };

    console.log('Register Metadata:', registerMetadata);

    const typedAgentId = 'whatsapp_register' as keyof typeof agents;

    const aiResponse = await this.generateAiResponseService.execute(
      message,
      sessionId,
      {
        agent_id: 'whatsapp_register',
      },
      typedAgentId,
      registerMetadata,
      {
        link_loja: 'https://anthor.lojavirtualnuvem.com.br',
      },
    );

    return aiResponse;
  }
}
