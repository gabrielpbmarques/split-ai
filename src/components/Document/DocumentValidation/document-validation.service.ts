import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { kafkaTopics } from 'src/config/kafka.config';
import {
  DocumentValidationMessage,
  DocumentValidationResponse,
} from 'src/components/Document/DocumentValidation/document-validation.dto';
import {
  IKafkaService,
  KAFKA_SERVICE,
} from 'src/infrastructure/providers/kafka.provider';
import { ExtractOcrTextService } from 'src/components/Document/ExtractOcrText/extract-ocr-text.service';
import { getUrlBuffer } from 'src/utils/getUrlBuffer';
import { FaceMatchService } from 'src/components/Document/FaceMatch/face-match.service';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UserRepository } from 'src/repositories/User.repository';
import { PictureRepository } from 'src/repositories/Picture.repository';

@Injectable()
export class DocumentValidationService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaService: IKafkaService,
    private readonly extractOcrTextService: ExtractOcrTextService,
    private readonly faceMatchService: FaceMatchService,
    private readonly workerRepository: WorkerRepository,
    private readonly pictureRepository: PictureRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async execute(
    payload: DocumentValidationMessage,
  ): Promise<DocumentValidationResponse | { errors: string[] }> {
    const workerId = payload.workerId;

    let documentFrontUrl = payload.documentFrontUrl;
    let documentBackUrl = payload.documentBackUrl;
    let selfieUrl = payload.selfieUrl;
    const errors: string[] = [];

    if ((!documentFrontUrl || !documentBackUrl || !selfieUrl) && workerId) {
      const documentUrls = await this.getDocumentsUrlByWorkerId(workerId);

      documentFrontUrl = !documentFrontUrl
        ? documentUrls.frontDocumentUrl
        : documentFrontUrl;
      documentBackUrl = !documentBackUrl
        ? documentUrls.backDocumentUrl
        : documentBackUrl;
      selfieUrl = !selfieUrl ? documentUrls.selfieUrl : selfieUrl;
    }

    if (!documentFrontUrl && !documentBackUrl) {
      errors.push('Nenhuma imagem de documento fornecida');
    }

    if (!selfieUrl) {
      errors.push('Nenhuma selfie fornecida');
    }

    if (errors.length) {
      return { errors };
    }

    const frontImageBuffer = await getUrlBuffer(documentFrontUrl);
    const backImageBuffer = await getUrlBuffer(documentBackUrl);
    const selfieBuffer = await getUrlBuffer(selfieUrl);

    const extractionResult = await this.extractOcrTextService.execute(
      frontImageBuffer,
      backImageBuffer,
    );

    const faceMatchResult = await this.faceMatchService.compareFaces(
      frontImageBuffer,
      selfieBuffer,
    );

    return {
      ...extractionResult,
      ...faceMatchResult,
      errors: [
        ...(extractionResult.errors || []),
        ...(faceMatchResult.errors || []),
      ],
    };
  }

  private async startConsumer() {
    await this.kafkaService.subscribe(
      kafkaTopics.validateDocuments,
      'document-validation-group',
      this.handleMessage.bind(this),
    );
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { message } = payload;
    const messageContent = message.value?.toString();

    if (!messageContent) return;

    const validationMessage: DocumentValidationMessage =
      JSON.parse(messageContent);

    const result = await this.execute(validationMessage);

    return result;
  }

  private async getDocumentsUrlByWorkerId(workerId: string): Promise<{
    frontDocumentUrl: string;
    backDocumentUrl: string;
    selfieUrl: string;
  }> {
    const {
      documents: { rgFrontId, rgBackId },
    } = await this.workerRepository.findById(workerId);
    const { profilePictureId } =
      await this.userRepository.findByWorkerId(workerId);

    const { image: frontDocumentUrl } =
      await this.pictureRepository.findById(rgFrontId);
    const { image: backDocumentUrl } =
      await this.pictureRepository.findById(rgBackId);
    const { image: selfieUrl } =
      await this.pictureRepository.findById(profilePictureId);

    return { frontDocumentUrl, backDocumentUrl, selfieUrl };
  }
}
