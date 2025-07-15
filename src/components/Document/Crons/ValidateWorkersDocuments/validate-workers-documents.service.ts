import { Injectable } from '@nestjs/common';
import { DocumentValidationService } from 'src/components/Document/DocumentValidation/document-validation.service';
import { DocumentValidationMessage } from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.dto';
import { config } from 'src/config';
import { WorkerRepository } from 'src/repositories/Worker.repository';

@Injectable()
export class ValidateWorkersDocumentsService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly documentValidationService: DocumentValidationService,
  ) {}

  async execute() {
    const workers = await this.workerRepository.aggregate([
      {
        $match: {
          status: 'inAnalysis',
          documents: {
            rgFrontId: { $ne: null },
            rgBackId: { $ne: null },
          },
        },
      },
      {
        $addFields: {
          $workerIdString: {
            $toString: '$_id',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '$workerIdString',
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

    for await (const worker of workers) {
      const documentValidationMessage: DocumentValidationMessage = {
        workerId: worker._id.toString(),
        documentFrontUrl: this.getDocumentUrl(worker.rgFrontId),
        documentBackUrl: this.getDocumentUrl(worker.rgBackId),
        selfieUrl: this.getDocumentUrl(worker.profilePictureId),
        timestamp: new Date(),
      };

      await this.documentValidationService.execute(documentValidationMessage);
    }
  }

  private getDocumentUrl(documentId: string): string {
    return `${config.awsS3Url}/${config.awsS3BucketName}/${documentId}.jpeg`;
  }
}
