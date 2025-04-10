import { Injectable } from '@nestjs/common';
import { WhatsappMessageDto } from './whatsapp-message.dto';
// Importando os serviços de caso de uso criados
import { FindOrCreateSessionService } from '../FindOrCreateSession/find-or-create-session.service';
import { ProcessMessageDataService } from '../ProcessMessageData/process-message-data.service';
import { UpdateWorkerService } from '../UpdateWorker/update-worker.service';
import { GenerateResponseService } from '../GenerateResponse/generate-response.service';
import { SessionRepository } from '../../../repositories/Session.repository';

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
    private readonly sessionRepository: SessionRepository,
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
    await this.updateLastAiResponse(sessionId, aiResponse);

    // 6. Retornar resposta
    return {
      sessionId,
      message: aiResponse,
      currentStage: updatedWorker.signupStage,
    };
  }

  /**
   * Atualiza a última resposta da IA na sessão
   * @param sessionId ID da sessão
   * @param aiResponse Resposta da IA
   */
  private async updateLastAiResponse(
    sessionId: string,
    aiResponse: string,
  ): Promise<void> {
    try {
      // Busca a sessão pelo ID
      const session = await this.sessionRepository.findBySessionId(sessionId);

      if (session) {
        // Atualiza a última resposta da IA e a data da última interação
        await this.sessionRepository.update(session._id.toString(), {
          lastAiResponse: aiResponse,
          lastInteraction: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar a última resposta da IA:', error);
    }
  }
}
