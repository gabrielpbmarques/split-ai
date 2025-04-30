import { Inject, Injectable, Logger } from '@nestjs/common';
import { WhatsappMessageDto } from 'src/components/Register/WhatsappMessage/whatsapp-message.dto';
// Imports dos componentes migrados
import { FindOrCreateSessionService } from 'src/components/SessionManagement/FindOrCreateSession/find-or-create-session.service';
import { ProcessMessageDataService } from 'src/components/MessageProcessing/ProcessMessageData/process-message-data.service';
import { UpdateWorkerService } from 'src/components/Register/UpdateWorker/update-worker.service';
import { GenerateResponseService } from 'src/components/Register/GenerateResponse/generate-response.service';
import { UpdateLastAiResponseService } from 'src/components/SessionManagement/UpdateLastAiResponse/update-last-ai-response.service';
import { ProcessImageMessageService } from 'src/components/MediaProcessing/ProcessImageMessage/process-image-message.service';
import { UpdateDocumentService } from 'src/components/MediaProcessing/UpdateDocument/update-document.service';
import { HandleRegisterCompletionService } from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.service';
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
  private readonly logger = new Logger(WhatsappMessageService.name);

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
    private readonly handleRegisterCompletionService: HandleRegisterCompletionService,
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

    // 1. Inicialização da sessão e contexto
    const { sessionId, worker, isNewUser, lastAiResponse } =
      await this.findOrCreateSessionService.execute({
        sessionId: existingSessionId,
        phoneNumber,
      });

    const messageText = this.formatMessageWithMedia(message, mediaUrl);

    // 2. Processamento da mensagem pela IA de extração
    let parsedData = await this.processMessageDataService.execute({
      message: messageText,
      sessionId,
      promptVariables: {
        worker: {
          ...worker,
          isNewUser,
        },
        lastAiResponse,
      },
    });

    // 3. Processamento de CEP e endereço
    parsedData = await this.processAddressInfo(parsedData);

    // 4. Processamento de reset de senha
    if (parsedData?.resetPassword) {
      await this.handlePasswordReset(worker.email);
    }

    // 5. Processamento de imagens
    let processedImageInfo = null;
    if (mediaUrl) {
      processedImageInfo = await this.handleImageMessage(
        worker,
        mediaUrl,
        sessionId,
        parsedData.image?.type,
      );
    }

    // 6. Atualização dos dados do worker
    const updatedWorker = await this.updateWorkerIfValid(
      worker,
      parsedData,
      sessionId,
      phoneNumber,
    );

    // 7. Geração da resposta da IA conversacional
    const aiResponse = await this.generateResponseService.execute({
      message: messageText,
      sessionId,
      phoneNumber,
      worker: updatedWorker,
      isNewUser,
      processedImage: processedImageInfo,
      parsedData,
    });

    await this.updateLastAiResponseService.execute(sessionId, aiResponse);

    this.logger.debug(parsedData);

    // 8. Finalização do cadastro
    if (parsedData?.finalizeRegistration) {
      await this.handleRegistrationFinalization(updatedWorker);
    }

    // 9. Processamento de reenvio de documentos
    await this.handleDocumentResending(
      updatedWorker,
      parsedData,
      mediaUrl,
      isNewUser,
    );

    return {
      sessionId,
      message: aiResponse,
      currentStage: updatedWorker?.signupStage || 'personal_info',
    };
  }

  /**
   * Formata a mensagem com a URL da imagem, se existir
   */
  private formatMessageWithMedia(message: string, mediaUrl?: string): string {
    return mediaUrl ? `${message}\n[Url da Imagem]: ${mediaUrl}` : message;
  }

  /**
   * Processa informações de endereço utilizando o serviço de CEP
   */
  private async processAddressInfo(parsedData: any): Promise<any> {
    if (parsedData?.address?.zipCode) {
      const addressInfo = await CepService.getAddressByCepWithFallback(
        parsedData.address.zipCode,
      );
      return {
        ...parsedData,
        address: {
          ...parsedData.address,
          ...addressInfo,
        },
      };
    }
    return parsedData;
  }

  /**
   * Processa solicitação de reset de senha
   */
  private async handlePasswordReset(email: string): Promise<void> {
    if (!email) return;

    await this.anthorClient.users.forgotPassword({
      email,
      type: 'worker',
    });
    this.logger.log(`Solicitação de reset de senha enviada para: ${email}`);
  }

  /**
   * Atualiza o worker apenas se não houver campos inválidos
   */
  private async updateWorkerIfValid(
    worker: Worker,
    parsedData: any,
    sessionId: string,
    phoneNumber: string,
  ): Promise<Worker> {
    if (
      !parsedData?.invalidFields ||
      Object.keys(parsedData.invalidFields).length === 0
    ) {
      return await this.updateWorkerService.execute({
        worker,
        parsedData,
        sessionId,
        phoneNumber,
      });
    }
    return worker;
  }

  /**
   * Processa a finalização do cadastro
   */
  private async handleRegistrationFinalization(worker: Worker): Promise<void> {
    this.logger.log(`Finalizando cadastro para o worker: ${worker._id}`);

    if (worker.email) {
      await this.emailService.send({
        to: worker.email,
        subject: 'Cadastro Completo',
        templateId: config.finishSignUpTemplateId,
      });
      this.logger.log(`Email de boas-vindas enviado para: ${worker.email}`);
    }

    await this.handleRegisterCompletionService.execute({
      workerId: worker._id.toString(),
      signupStage: worker.signupStage,
    });
  }

  /**
   * Processa o reenvio de documentos
   */
  private async handleDocumentResending(
    worker: Worker,
    parsedData: any,
    mediaUrl?: string,
    isNewUser?: boolean,
  ): Promise<void> {
    // Verificamos condições para reenvio de documentos
    const hasDocumentValidationErrors =
      worker.documents?.documentValidationResult?.errors?.length > 0;
    const isDocumentImage =
      mediaUrl &&
      ['document_front', 'document_back', 't_shirt_selfie'].includes(
        parsedData?.image?.type,
      );

    // Caso 1: Documentos com erros e nova imagem sendo enviada
    if (hasDocumentValidationErrors && isDocumentImage && !isNewUser) {
      if (!parsedData.documentResending) {
        parsedData.documentResending = true;
        this.logger.log(
          `Forçando flag documentResending para o worker: ${worker._id}`,
        );
      }

      this.logger.log(
        `Processando reenvio de documentos para o worker: ${worker._id}`,
      );
      await this.handleRegisterCompletionService.execute({
        workerId: worker._id.toString(),
        signupStage: worker.signupStage,
      });
    }
    // Caso 2: Parser já identificou como reenvio
    else if (parsedData?.documentResending && isDocumentImage) {
      this.logger.log(
        `Detectado reenvio de documentos para o worker: ${worker._id}`,
      );
      await this.handleRegisterCompletionService.execute({
        workerId: worker._id.toString(),
        signupStage: worker.signupStage,
      });
    }
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
