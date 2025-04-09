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
    const { message, sessionId, phoneNumber, worker, isNewUser } =
      generateResponseDto;

    // Prepara os metadados para o agente de comunicação
    // Fornecendo todo o contexto necessário para a IA orquestrar o processo
    const registerMetadata: RegisterContextMetadata = {
      phone_number: phoneNumber,
      registration_stage: worker.signupStage,
      is_new_user: isNewUser,
      user_data: worker,
    };

    // A IA atua como orquestradora principal do processo, decidindo o fluxo
    // com base no contexto e na mensagem do usuário
    const typedAgentId = 'whatsapp_register' as keyof typeof agents;

    const aiResponse = await this.generateAiResponseService.execute(
      message,
      sessionId,
      {
        agent_id: 'whatsapp_register',
      },
      typedAgentId,
      registerMetadata,
    );

    return aiResponse;
  }
}
