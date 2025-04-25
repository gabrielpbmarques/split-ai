import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { kafkaTopics } from 'src/config/kafka.config';
import { EachMessagePayload } from 'kafkajs';
import {
  DocumentValidationMessage,
  DocumentValidationResult,
} from './document-validation.dto';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { DocumentValidation } from 'src/schemas/DocumentValidation.schema';
import {
  IKafkaService,
  KAFKA_SERVICE,
} from 'src/infrastructure/providers/kafka.provider';

@Injectable()
export class DocumentValidationService implements OnModuleInit {
  private readonly logger = new Logger(DocumentValidationService.name);

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaService: IKafkaService,
    private readonly workerRepository: WorkerRepository,
  ) {}

  async onModuleInit() {
    // Iniciar o consumidor Kafka
    await this.startConsumer();
  }

  private async startConsumer() {
    try {
      await this.kafkaService.subscribe(
        kafkaTopics.validateDocuments,
        'document-validation-group',
        this.handleMessage.bind(this),
      );
      this.logger.log('Document validation consumer started successfully');
    } catch (error) {
      this.logger.error(
        `Failed to start document validation consumer: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    try {
      const { message } = payload;
      const messageContent = message.value?.toString();

      if (!messageContent) {
        this.logger.warn('Received empty message');
        return;
      }

      const validationMessage: DocumentValidationMessage =
        JSON.parse(messageContent);
      this.logger.log(
        `Processing document validation for worker: ${validationMessage.workerId}`,
      );

      // Aqui seria implementada a lógica de validação de documentos com IA de visão
      // Por enquanto, vamos simular o processo
      await this.processDocumentValidation(validationMessage);
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processDocumentValidation(message: DocumentValidationMessage) {
    try {
      // Verificar se temos todas as imagens necessárias
      if (!message.documentFrontUrl || !message.selfieUrl) {
        this.logger.warn(
          `Missing required images for worker: ${message.workerId}`,
        );
        return;
      }

      // Simular o processo de validação
      // Em uma implementação real, aqui seria feita a chamada para a API de visão
      const validationResult: DocumentValidationResult = {
        workerId: message.workerId,
        isValid: true, // Simulando validação bem-sucedida
        faceMatchScore: 0.85, // Simulando score de correspondência facial
        documentAuthenticityScore: 0.92, // Simulando score de autenticidade do documento
        validatedAt: new Date(),
      };

      // Atualizar o status de validação do trabalhador
      await this.updateWorkerValidationStatus(validationResult);

      this.logger.log(
        `Document validation completed for worker: ${message.workerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing document validation: ${error.message}`,
        error.stack,
      );
    }
  }

  private async updateWorkerValidationStatus(result: DocumentValidationResult) {
    try {
      const worker = await this.workerRepository.findById(result.workerId);

      if (!worker) {
        this.logger.warn(`Worker not found: ${result.workerId}`);
        return;
      }

      // Criar o objeto de validação de documentos
      const documentValidation: DocumentValidation = {
        isValid: result.isValid,
        faceMatchScore: result.faceMatchScore,
        documentAuthenticityScore: result.documentAuthenticityScore,
        validatedAt: result.validatedAt,
        errors: result.errors || [],
        isRemoved: false,
        removedAt: null,
      };

      // Atualizar o worker com os dados de validação
      const updatedWorker = {
        ...worker,
        documentValidation,
      };

      // Salvar as alterações - usando o ID como string
      const workerId = worker._id?.toString();
      if (workerId) {
        await this.workerRepository.update(workerId, updatedWorker);
        this.logger.log(`Worker validation status updated: ${result.workerId}`);
      } else {
        this.logger.warn(`Worker ID is undefined: ${result.workerId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error updating worker validation status: ${error.message}`,
        error.stack,
      );
    }
  }
}
