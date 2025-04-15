import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(WhatsappMessageService.name);
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
    this.logger.log(
      `Iniciando processamento da mensagem do WhatsApp para o número: ${whatsappMessageDto.phoneNumber}`,
    );
    try {
      const {
        phoneNumber,
        message,
        sessionId: existingSessionId,
      } = whatsappMessageDto;

      // 1. Recuperar ou criar sessão usando o caso de uso dedicado
      this.logger.debug('Recuperando ou criando sessão...');
      const { sessionId, worker, isNewUser, lastAiResponse } =
        await this.findOrCreateSessionService.execute({
          sessionId: existingSessionId,
          phoneNumber,
        });
      if (isNewUser) {
        this.logger.log(
          `Novo usuário detectado para o número: ${phoneNumber}. Iniciando cadastro do zero.`,
        );
      } else {
        this.logger.log(
          `Usuário existente detectado para o número: ${phoneNumber}. Continuando cadastro na etapa: ${worker.signupStage}`,
        );
      }
      this.logger.log(
        `Sessão ${sessionId} recuperada/criada para o número: ${phoneNumber}. Usuário novo: ${isNewUser}`,
      );

      // 2. Processar a mensagem para extrair dados estruturados
      this.logger.debug(
        'Processando mensagem para extrair dados estruturados...',
      );
      const parsedData = await this.processMessageDataService.execute({
        message,
        sessionId,
        lastAiResponse, // Passando a última resposta da IA como contexto
      });
      if (!parsedData || Object.keys(parsedData).length === 0) {
        this.logger.warn(
          `Nenhum dado relevante extraído da mensagem recebida para o número: ${phoneNumber}`,
        );
      }
      this.logger.verbose(
        `Dados extraídos da mensagem: ${JSON.stringify(parsedData)}`,
      );

      // 3. Atualizar o worker com os dados processados
      this.logger.debug('Atualizando worker com os dados processados...');
      let updatedWorker;
      try {
        updatedWorker = await this.updateWorkerService.execute({
          worker,
          parsedData,
          sessionId,
          phoneNumber,
        });
        this.logger.verbose(
          `Worker atualizado: ${JSON.stringify({ id: updatedWorker.id, signupStage: updatedWorker.signupStage })}`,
        );
      } catch (error) {
        this.logger.error(
          `Erro ao atualizar worker para o número: ${phoneNumber}. Erro: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // 4. Gerar resposta da IA (a IA é a orquestradora principal do processo)
      this.logger.debug('Gerando resposta da IA...');
      let aiResponse;
      try {
        aiResponse = await this.generateResponseService.execute({
          message,
          sessionId,
          phoneNumber,
          worker: updatedWorker,
          isNewUser,
        });
        this.logger.verbose(`Resposta da IA gerada: ${aiResponse}`);
      } catch (error) {
        this.logger.error(
          `Erro ao gerar resposta da IA para o número: ${phoneNumber}. Erro: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // 5. Atualizar a sessão com a última resposta da IA
      this.logger.debug('Atualizando sessão com a última resposta da IA...');
      try {
        await this.updateLastAiResponseService.execute(sessionId, aiResponse);
      } catch (error) {
        this.logger.error(
          `Erro ao atualizar a última resposta da IA na sessão ${sessionId} para o número: ${phoneNumber}. Erro: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // 6. Retornar resposta
      this.logger.log(
        `Fluxo de mensagem do WhatsApp finalizado para o número: ${phoneNumber}, etapa atual: ${updatedWorker.signupStage}`,
      );
      return {
        sessionId,
        message: aiResponse,
        currentStage: updatedWorker.signupStage,
      };
    } catch (error) {
      this.logger.error(
        `Erro inesperado no fluxo de mensagem do WhatsApp para o número: ${whatsappMessageDto.phoneNumber}. Erro: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
