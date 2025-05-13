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
import {
  ExtractOcrTextResponse,
  ExtractOcrTextService,
} from 'src/components/Document/ExtractOcrText/extract-ocr-text.service';
import { getUrlBuffer } from 'src/utils/getUrlBuffer';
import { FaceMatchService } from 'src/components/Document/FaceMatch/face-match.service';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UserRepository } from 'src/repositories/User.repository';
import { PictureRepository } from 'src/repositories/Picture.repository';
import * as moment from 'moment-timezone';

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

    const validationErrors = await this.compareDocumentWithWorkerInfo(
      extractionResult,
      workerId,
    );

    const validationResult = {
      ...extractionResult,
      ...faceMatchResult,
      errors: [
        ...(extractionResult.errors || []),
        ...(faceMatchResult.errors || []),
        ...validationErrors,
      ],
    };

    await this.validateWorkerDocuments(workerId, validationResult);

    return validationResult;
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

  private async compareDocumentWithWorkerInfo(
    extractionResult: ExtractOcrTextResponse,
    workerId: string,
  ) {
    const errors: string[] = [];
    const { name, birthDate, cpf } = extractionResult;

    const worker = await this.workerRepository.findById(workerId);

    if (!worker) {
      throw new Error(`Worker not found with ID: ${workerId}`);
    }

    const {
      name: workerName,
      birthDate: workerBirthDate,
      cpf: workerCpf,
    } = worker;

    if (name?.trim().toUpperCase() !== workerName?.trim().toUpperCase()) {
      errors.push('Names do not match');
    }

    let docDay, docMonth, docYear;
    if (typeof birthDate === 'string' && birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        docDay = parseInt(parts[0], 10);
        docMonth = parseInt(parts[1], 10);
        docYear = parseInt(parts[2], 10);
      }
    }

    let workerDay, workerMonth, workerYear;
    if (workerBirthDate) {
      // eslint-disable-next-line import/namespace
      const m = moment.utc(workerBirthDate);
      workerDay = m.date(); // Day of month
      workerMonth = m.month() + 1; // Convert from 0-indexed to 1-indexed
      workerYear = m.year();
    }

    const yearMatch = docYear === workerYear;
    const monthMatch = docMonth === workerMonth;
    const dayMatch = docDay === workerDay;

    if (
      docDay &&
      docMonth &&
      docYear &&
      workerDay &&
      workerMonth &&
      workerYear &&
      (!yearMatch || !monthMatch || !dayMatch)
    ) {
      errors.push('Birth dates do not match');
    }

    if (cpf?.trim().toUpperCase() !== workerCpf?.trim().toUpperCase()) {
      errors.push('CPF numbers do not match');
    }

    return errors;
  }

  private async validateWorkerDocuments(
    workerId: string,
    validationResult: DocumentValidationResponse,
  ) {
    const worker = await this.workerRepository.findById(workerId);

    if (!worker) {
      throw new Error(`Worker not found with ID: ${workerId}`);
    }

    await this.workerRepository.update(workerId, {
      documents: {
        status: validationResult.errors.length ? 'pending' : 'approved',
        documentValidationResult: validationResult,
      },
    });
  }
}
