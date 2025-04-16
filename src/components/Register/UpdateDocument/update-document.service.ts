import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';

export interface UpdateDocumentDto {
  workerId: string;
  documentType: 'profile' | 'document_front' | 'document_back' | 'selfie';
  imageUrl: string;
  pictureId?: string;
}

@Injectable()
export class UpdateDocumentService {
  constructor(private readonly workerRepository: WorkerRepository) {}

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
      case 'profile':
        updateData['profilePicture'] = dto.imageUrl;
        if (dto.pictureId) {
          updateData['profilePictureId'] = dto.pictureId;
        }
        break;
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
    }

    await this.workerRepository.update(dto.workerId, updateData);

    if (dto.documentType === 'profile') {
      await this.updateSignupStage(dto.workerId, 'profile_picture');
    } else if (dto.documentType === 'selfie') {
      await this.updateSignupStage(dto.workerId, 'document');
    }
  }

  /**
   * Atualiza o estágio de cadastro do worker
   * @param workerId ID do worker
   * @param stage Novo estágio de cadastro
   */
  private async updateSignupStage(
    workerId: string,
    stage: string,
  ): Promise<void> {
    await this.workerRepository.update(workerId, { signupStage: stage });
  }
}
