import { Injectable } from '@nestjs/common';
import { WhatsappMessageDto } from './whatsapp-message.dto';
import { FindOrCreateSessionService } from '../FindOrCreateSession/find-or-create-session.service';
import { ProcessMessageDataService } from '../ProcessMessageData/process-message-data.service';
import { UpdateWorkerService } from '../UpdateWorker/update-worker.service';
import { GenerateResponseService } from '../GenerateResponse/generate-response.service';
import { UpdateLastAiResponseService } from '../UpdateLastAiResponse/update-last-ai-response.service';
import { ProcessImageMessageService } from '../ProcessImageMessage/process-image-message.service';
import { UpdateDocumentService } from '../UpdateDocument/update-document.service';
import { Worker } from 'src/models/Worker.model';

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

    console.log('Message:', message);

    const parsedData = await this.processMessageDataService.execute({
      message: mediaUrl ? `${message}\n[Url da Imagem]: ${mediaUrl}` : message,
      sessionId,
      lastAiResponse,
    });

    console.log('parsedData', parsedData);

    let processedImageInfo = null;

    if (mediaUrl) {
      processedImageInfo = await this.handleImageMessage(
        worker,
        mediaUrl,
        sessionId,
        parsedData.imageType,
      );
    }

    let updatedWorker: Worker | null;

    if (
      !parsedData?.invalidFields ||
      Object.keys(parsedData.invalidFields).length === 0
    ) {
      updatedWorker = await this.updateWorkerService.execute({
        worker,
        parsedData,
        sessionId,
        phoneNumber,
      });
    } else {
      // Se houver campos inválidos, mantém o worker original
      updatedWorker = worker;
    }

    const messageText =
      mediaUrl && !message
        ? `[Imagem enviada pelo usuário - ${parsedData.imageType}]`
        : message;

    const aiResponse = await this.generateResponseService.execute({
      message: messageText,
      sessionId,
      phoneNumber,
      worker: updatedWorker,
      isNewUser,
      processedImage: processedImageInfo,
      invalidFields: parsedData.invalidFields,
    });

    await this.updateLastAiResponseService.execute(sessionId, aiResponse);

    return {
      sessionId,
      message: aiResponse,
      currentStage: updatedWorker?.signupStage || 'personal_info',
    };
  }

  private async handleImageMessage(
    worker: Worker,
    mediaUrl: string,
    sessionId: string,
    imageType: 'profile' | 'document_front' | 'document_back' | 'selfie',
  ) {
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

      return {
        type: imageType,
        url: processedImage.url,
        pictureId: processedImage.pictureId,
        success: true,
        message: `Imagem do tipo ${imageType} processada com sucesso`,
      };
    }
  }
}
