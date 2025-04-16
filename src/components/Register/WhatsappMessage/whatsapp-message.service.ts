import { Injectable } from '@nestjs/common';
import { WhatsappMessageDto } from './whatsapp-message.dto';
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
  constructor(
    private readonly findOrCreateSessionService: FindOrCreateSessionService,
    private readonly processMessageDataService: ProcessMessageDataService,
    private readonly updateWorkerService: UpdateWorkerService,
    private readonly generateResponseService: GenerateResponseService,
    private readonly updateLastAiResponseService: UpdateLastAiResponseService,
    private readonly processImageMessageService: ProcessImageMessageService,
    private readonly updateDocumentService: UpdateDocumentService,
  ) {}

  async execute(
    whatsappMessageDto: WhatsappMessageDto,
  ): Promise<WhatsappMessageResponse> {
    const {
      phoneNumber,
      message,
      sessionId: existingSessionId,
      mediaUrl,
    } = whatsappMessageDto;

    const { sessionId, worker, isNewUser, lastAiResponse } =
      await this.findOrCreateSessionService.execute({
        sessionId: existingSessionId,
        phoneNumber,
      });

    let processedImageInfo = null;

    if (mediaUrl) {
      const imageType = this.determineImageType(worker);

      const processedImage = await this.processImageMessageService.execute({
        imageUrl: mediaUrl,
        sessionId,
        imageType,
      });

      if (worker._id) {
        await this.updateDocumentService.execute({
          workerId: worker._id.toString(),
          documentType: imageType,
          imageUrl: processedImage.url,
          pictureId: processedImage.pictureId,
        });

        processedImageInfo = {
          type: imageType,
          url: processedImage.url,
          pictureId: processedImage.pictureId,
          success: true,
          message: `Imagem do tipo ${imageType} processada com sucesso`,
        };
      }
    }

    const parsedData = await this.processMessageDataService.execute({
      message,
      sessionId,
      lastAiResponse,
    });

    let updatedWorker;
    let invalidFields = null;

    if (
      parsedData?.invalidFields &&
      Object.keys(parsedData.invalidFields).length > 0
    ) {
      invalidFields = parsedData.invalidFields;

      updatedWorker = worker;
    } else {
      updatedWorker = await this.updateWorkerService.execute({
        worker,
        parsedData,
        sessionId,
        phoneNumber,
      });
    }

    const messageText =
      mediaUrl && !message
        ? `[Imagem enviada pelo usuário - ${this.determineImageType(worker)}]`
        : message;

    const aiResponse = await this.generateResponseService.execute({
      message: messageText,
      sessionId,
      phoneNumber,
      worker: updatedWorker,
      isNewUser,
      processedImage: processedImageInfo,
      invalidFields,
    });

    await this.updateLastAiResponseService.execute(sessionId, aiResponse);

    return {
      sessionId,
      message: aiResponse,
      currentStage: updatedWorker.signupStage,
    };
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
