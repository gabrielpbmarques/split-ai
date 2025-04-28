import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { kafkaTopics } from 'src/config/kafka.config';
import { DocumentValidationMessage } from './document-validation.dto';
import {
  IKafkaService,
  KAFKA_SERVICE,
} from 'src/infrastructure/providers/kafka.provider';
import { ExtractOcrTextService } from '../ExtractOcrText/extract-ocr-text.service';
import { getUrlBuffer } from 'src/utils/getUrlBuffer';

@Injectable()
export class DocumentValidationService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaService: IKafkaService,
    private readonly extractOcrTextService: ExtractOcrTextService,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async execute(payload: DocumentValidationMessage): Promise<any> {
    const { documentBackUrl, documentFrontUrl } = payload;

    if (!documentFrontUrl && !documentBackUrl) {
      console.log('Nenhuma imagem de documento fornecida');
      return { errors: ['Nenhuma imagem de documento fornecida'] };
    }

    const buffers: Buffer[] = [];

    if (documentFrontUrl) {
      const frontBuffer = await getUrlBuffer(documentFrontUrl);
      buffers.push(frontBuffer);
    }

    if (documentBackUrl) {
      const backBuffer = await getUrlBuffer(documentBackUrl);
      buffers.push(backBuffer);
    }

    if (!buffers.length) {
      console.log('Nenhuma imagem de documento fornecida');
      return { errors: ['Nenhuma imagem de documento fornecida'] };
    }

    const extractionResult = await this.extractOcrTextService.execute(buffers);

    return extractionResult;
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

    console.log('Resultado da validação de documento:', result);
  }
}
