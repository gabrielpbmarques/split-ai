import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { DocumentValidationService } from 'src/components/Document/DocumentValidation/document-validation.service';
import { DocumentValidationMessage } from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.dto';
import { config } from 'src/config';
import { WorkerRepository } from 'src/repositories/Worker.repository';

@Injectable()
export class ValidateWorkersDocumentsService {
  private logger = new Logger(ValidateWorkersDocumentsService.name);
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly documentValidationService: DocumentValidationService,
  ) {}

  async execute() {
    this.logger.log('Validating workers documents...');
    const workers = await this.workerRepository.aggregate([
      {
        $match: {
          status: 'inAnalysis',
          'documents.status': { $ne: 'approved' },
          'documents.rgFrontId': { $ne: null },
          'documents.rgBackId': { $ne: null },
          createdAt: {
            $gte: moment().utc().startOf('week').toDate(),
          },
        },
      },
      {
        $addFields: {
          workerIdString: {
            $toString: '$_id',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'workerIdString',
          foreignField: 'workerId',
          pipeline: [
            {
              $match: {
                profilePictureId: { $ne: null },
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          rgFrontId: { $first: '$documents.rgFrontId' },
          rgBackId: { $first: '$documents.rgBackId' },
          profilePictureId: { $first: '$user.profilePictureId' },
        },
      },
    ]);

    this.logger.log(`Encontrados ${workers.length} trabalhadores para validar`);

    for await (const worker of workers) {
      const documentValidationMessage: DocumentValidationMessage = {
        workerId: worker._id.toString(),
        documentFrontUrl: this.getDocumentUrl(worker.rgFrontId),
        documentBackUrl: this.getDocumentUrl(worker.rgBackId),
        selfieUrl: this.getDocumentUrl(worker.profilePictureId),
        timestamp: new Date(),
      };

      this.logger.log(
        `Validando documentos do trabalhador ${worker._id.toString()}`,
      );

      await this.documentValidationService.execute(documentValidationMessage);
    }
  }

  private getDocumentUrl(documentId: string): string {
    return `${config.awsS3Url}/${config.awsS3BucketName}/${documentId}.jpeg`;
  }
}
