import { Injectable } from '@nestjs/common';
import { WhatsappMessageDto } from './whatsapp-message.dto';
// Importando os serviços de caso de uso criados
import { FindOrCreateSessionService } from '../FindOrCreateSession/find-or-create-session.service';
import { ProcessMessageDataService } from '../ProcessMessageData/process-message-data.service';
import { UpdateWorkerService } from '../UpdateWorker/update-worker.service';
import { GenerateResponseService } from '../GenerateResponse/generate-response.service';
import { UpdateLastAiResponseService } from '../UpdateLastAiResponse/update-last-ai-response.service';

export interface WhatsappMessageResponse {
  sessionId: string;
  message: string;
  currentStage: string;
}

@Injectable()
export class WhatsappMessageService {
  constructor(
    // Injetando os serviços de caso de uso
    private readonly findOrCreateSessionService: FindOrCreateSessionService,
    private readonly processMessageDataService: ProcessMessageDataService,
    private readonly updateWorkerService: UpdateWorkerService,
    private readonly generateResponseService: GenerateResponseService,
    private readonly updateLastAiResponseService: UpdateLastAiResponseService,
  ) {}

  /**
   * Executa o fluxo de processamento de mensagens do WhatsApp
   * Utilizando a IA como orquestradora principal do processo
   */
  async execute(
    whatsappMessageDto: WhatsappMessageDto,
  ): Promise<WhatsappMessageResponse> {
    const {
      phoneNumber,
      message,
      sessionId: existingSessionId,
    } = whatsappMessageDto;

    // 1. Recuperar ou criar sessão usando o caso de uso dedicado
    const { sessionId, worker, isNewUser, lastAiResponse } =
      await this.findOrCreateSessionService.execute({
        sessionId: existingSessionId,
        phoneNumber,
      });

    // 2. Processar a mensagem para extrair dados estruturados
    const parsedData = await this.processMessageDataService.execute({
      message,
      sessionId,
      lastAiResponse, // Passando a última resposta da IA como contexto
    });

    // 3. Atualizar o worker com os dados processados
    const updatedWorker = await this.updateWorkerService.execute({
      worker,
      parsedData,
      sessionId,
      phoneNumber,
    });

    // 4. Gerar resposta da IA (a IA é a orquestradora principal do processo)
    const aiResponse = await this.generateResponseService.execute({
      message,
      sessionId,
      phoneNumber,
      worker: updatedWorker,
      isNewUser,
    });

    // 5. Atualizar a sessão com a última resposta da IA
    await this.updateLastAiResponseService.execute(sessionId, aiResponse);

    // 6. Retornar resposta
    return {
      sessionId,
      message: aiResponse,
      currentStage: updatedWorker.signupStage,
    };
  }
}
