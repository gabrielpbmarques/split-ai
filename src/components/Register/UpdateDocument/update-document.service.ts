import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { UserRepository } from 'src/repositories/User.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

export interface UpdateDocumentDto {
  workerId: string;
  documentType: 'profile' | 'document_front' | 'document_back' | 'selfie';
  imageUrl: string;
  pictureId?: string;
}

@Injectable()
export class UpdateDocumentService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Atualiza os documentos do worker com a URL da imagem
   * @param dto Dados do documento a ser atualizado
   */
  async execute(dto: UpdateDocumentDto): Promise<void> {
    const worker = await this.workerRepository.findById(dto.workerId);

    if (!worker) {
      throw new Error(`Worker não encontrado com ID: ${dto.workerId}`);
    }

    const updateData: any = {};

    if (!worker.documents) {
      updateData.documents = {
        isRemoved: false,
        removedAt: null,
        status: 'pending',
        observations: [],
        dateValidated: null,
        validator: null,
      };
    }

    switch (dto.documentType) {
      case 'document_front':
        if (dto.pictureId) {
          updateData['documents.rgFrontId'] = dto.pictureId;
        }
        updateData['documents.rgFrontUrl'] = dto.imageUrl;
        break;
      case 'document_back':
        if (dto.pictureId) {
          updateData['documents.rgBackId'] = dto.pictureId;
        }
        updateData['documents.rgBackUrl'] = dto.imageUrl;
        break;
      case 'selfie':
        if (dto.pictureId) {
          updateData['documents.tShirtSelfieId'] = dto.pictureId;
        }
        updateData['documents.tShirtSelfieUrl'] = dto.imageUrl;
        break;
      case 'profile':
        if (dto.pictureId) {
          await this.updateProfilePicture(dto.pictureId, dto.workerId);
        }
        break;
    }

    await this.workerRepository.update(dto.workerId, updateData);
  }

  private async updateProfilePicture(
    pictureId: string,
    workerId: string,
  ): Promise<void> {
    await this.userRepository.updateByWorkerId(workerId, {
      profilePictureId: pictureId as unknown as ObjectId,
    });
  }
}
