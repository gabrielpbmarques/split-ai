import { Inject, Injectable } from '@nestjs/common';
import { WhatsappMessageDto } from './whatsapp-message.dto';
import { FindOrCreateSessionService } from '../FindOrCreateSession/find-or-create-session.service';
import { ProcessMessageDataService } from '../ProcessMessageData/process-message-data.service';
import { UpdateWorkerService } from '../UpdateWorker/update-worker.service';
import { GenerateResponseService } from '../GenerateResponse/generate-response.service';
import { UpdateLastAiResponseService } from '../UpdateLastAiResponse/update-last-ai-response.service';
import { ProcessImageMessageService } from '../ProcessImageMessage/process-image-message.service';
import { UpdateDocumentService } from '../UpdateDocument/update-document.service';
import { Worker } from 'src/models/Worker.model';
import { EmailService } from 'src/components/Email/email.service';
import { config } from 'src/config';
import { Anthor } from '@anthor/entities-sdk';
import { EMAIL_SERVICE } from 'src/infrastructure/providers/sendgrid.provider';
import { ANTHOR_CLIENT } from 'src/infrastructure/providers/anthor.provider';
import { CepService } from 'src/services/cep.service';

export interface WhatsappMessageResponse {
  sessionId: string;
  message: string;
  currentStage: string;
}

@Injectable()
export class WhatsappMessageService {
  constructor(
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailService,
    @Inject(ANTHOR_CLIENT) private readonly anthorClient: Anthor,
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

    const messageText = mediaUrl
      ? `${message}\n[Url da Imagem]: ${mediaUrl}`
      : message;

    let parsedData = await this.processMessageDataService.execute({
      message: messageText,
      worker: {
        ...worker,
        isNewUser,
      },
      sessionId,
      lastAiResponse,
    });

    let processedImageInfo = null;

    if (parsedData?.address?.zipCode) {
      const addressInfo = await CepService.getAddressByCepWithFallback(
        parsedData.address.zipCode,
      );
      parsedData = {
        ...parsedData,
        address: {
          ...parsedData.address,
          ...addressInfo,
        },
      };
    }

    if (parsedData?.resetPassword) {
      await this.anthorClient.users.forgotPassword({
        email: worker.email,
        type: 'worker',
      });
    }

    if (mediaUrl) {
      processedImageInfo = await this.handleImageMessage(
        worker,
        mediaUrl,
        sessionId,
        parsedData.image?.type,
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
      updatedWorker = worker;
    }

    const aiResponse = await this.generateResponseService.execute({
      message: messageText,
      sessionId,
      phoneNumber,
      worker: updatedWorker,
      isNewUser,
      processedImage: processedImageInfo,
      invalidFields: parsedData.invalidFields,
      fieldsToUpdate: parsedData.fieldsToUpdate,
    });

    await this.updateLastAiResponseService.execute(sessionId, aiResponse);

    if (parsedData?.sendWelcomeEmail)
      await this.emailService.send({
        to: updatedWorker.email,
        subject: 'Cadastro Completo',
        templateId: config.finishSignUpTemplateId,
      });

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
    imageType:
      | 'profile'
      | 'document_front'
      | 'document_back'
      | 't_shirt_selfie',
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
