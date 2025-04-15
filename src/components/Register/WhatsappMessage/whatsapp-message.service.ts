import { Injectable, Logger } from '@nestjs/common';
import { WhatsappMessageDto } from './whatsapp-message.dto';
// Importando os serviços de caso de uso criados
import { FindOrCreateSessionService } from '../FindOrCreateSession/find-or-create-session.service';
import { ProcessMessageDataService } from '../ProcessMessageData/process-message-data.service';
import { UpdateWorkerService } from '../UpdateWorker/update-worker.service';
import { GenerateResponseService } from '../GenerateResponse/generate-response.service';
import { UpdateLastAiResponseService } from '../UpdateLastAiResponse/update-last-ai-response.service';
import { ProcessImageMessageService } from '../ProcessImageMessage/process-image-message.service';
import { UpdateDocumentService } from '../UpdateDocument/update-document.service';

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
    private readonly processImageMessageService: ProcessImageMessageService,
    private readonly updateDocumentService: UpdateDocumentService,
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
        mediaUrl, // URL da imagem, se existir
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

      // 2. Verificar se é uma mensagem de imagem
      if (mediaUrl) {
        this.logger.debug(`Detectada imagem na mensagem: ${mediaUrl}`);

        // Determinar o tipo de imagem esperado com base no estágio atual do cadastro
        const imageType = this.determineImageType(worker);
        this.logger.debug(`Tipo de imagem determinado: ${imageType}`);

        try {
          // Processar a imagem
          const imageUrl = await this.processImageMessageService.execute({
            imageUrl: mediaUrl,
            sessionId,
            imageType,
          });

          // Atualizar o documento do worker
          if (worker._id) {
            await this.updateDocumentService.execute({
              workerId: worker._id.toString(),
              documentType: imageType,
              imageUrl,
            });
            this.logger.debug(`Documento ${imageType} atualizado com sucesso`);
          }
        } catch (error) {
          this.logger.error(
            `Erro ao processar imagem: ${error.message}`,
            error.stack,
          );
          // Não lançamos o erro para não interromper o fluxo principal
        }
      }

      // 3. Processar a mensagem para extrair dados estruturados
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

  /**
   * Determina o tipo de imagem esperado com base no estágio atual do cadastro e nos documentos existentes
   * @param worker Dados do worker
   * @returns Tipo de imagem esperado
   */
  private determineImageType(
    worker: any,
  ): 'profile' | 'document_front' | 'document_back' | 'selfie' {
    // Verifica se já tem foto de perfil
    if (!worker.profilePicture) {
      return 'profile';
    }

    // Verifica se já tem documentos
    if (!worker.documents) {
      return 'document_front';
    }

    // Verifica qual documento está faltando
    if (!worker.documents.rgFrontId) {
      return 'document_front';
    } else if (!worker.documents.rgBackId) {
      return 'document_back';
    } else if (!worker.documents.tShirtSelfieId) {
      return 'selfie';
    }

    // Se todos os documentos já existirem, assume que é uma atualização da foto de perfil
    return 'profile';
  }
}
