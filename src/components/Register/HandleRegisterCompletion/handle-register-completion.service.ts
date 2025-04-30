import { Inject, Injectable, Logger } from '@nestjs/common';
import { kafkaTopics } from 'src/config/kafka.config';
import {
  DocumentValidationMessage,
  HandleRegisterCompletionDto,
} from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.dto';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { PictureRepository } from 'src/repositories/Picture.repository';
import { UserRepository } from 'src/repositories/User.repository';
import {
  IKafkaService,
  KAFKA_SERVICE,
} from 'src/infrastructure/providers/kafka.provider';

@Injectable()
export class HandleRegisterCompletionService {
  private readonly logger = new Logger(HandleRegisterCompletionService.name);

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaService: IKafkaService,
    private readonly workerRepository: WorkerRepository,
    private readonly pictureRepository: PictureRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: HandleRegisterCompletionDto): Promise<void> {
    const { workerId } = dto;

    try {
      const worker = await this.workerRepository.findById(workerId);
      if (!worker) {
        throw new Error(`Worker with ID ${workerId} not found`);
      }

      const user = await this.userRepository.findByWorkerId(workerId);
      if (!user) {
        throw new Error(`User for worker ID ${workerId} not found`);
      }

      const message: DocumentValidationMessage = {
        workerId,
        timestamp: new Date(),
      };

      if (worker.documents) {
        if (worker.documents.rgFrontId) {
          const frontDoc = await this.pictureRepository.findById(
            worker.documents.rgFrontId,
          );
          if (frontDoc) {
            message.documentFrontUrl = frontDoc.image;
          }
        }

        if (worker.documents.rgBackId) {
          const backDoc = await this.pictureRepository.findById(
            worker.documents.rgBackId,
          );
          if (backDoc) {
            message.documentBackUrl = backDoc.image;
          }
        }
      }
      if (user.profilePictureId) {
        const profilePic = await this.pictureRepository.findById(
          user.profilePictureId,
        );
        if (profilePic) {
          message.selfieUrl = profilePic.image;
        }
      }

      if (!message.documentFrontUrl || !message.selfieUrl) {
        this.logger.warn(`Missing required images for worker: ${workerId}`);
        return;
      }

      await this.kafkaService.publish(kafkaTopics.validateDocuments, message);
      this.logger.log(
        `Published document validation message for worker: ${workerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error publishing document validation message: ${error.message}`,
        error.stack,
      );
    }
  }
}
