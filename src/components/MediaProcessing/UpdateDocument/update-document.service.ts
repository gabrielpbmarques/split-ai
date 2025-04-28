import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { UserRepository } from 'src/repositories/User.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

export interface UpdateDocumentDto {
  workerId: string;
  documentType:
    | 'profile'
    | 'document_front'
    | 'document_back'
    | 't_shirt_selfie';
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
    try {
      const worker = await this.workerRepository.findById(dto.workerId);

      if (!worker) {
        throw new Error(`Worker não encontrado com ID: ${dto.workerId}`);
      }

      let updateData: any = {};

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

      const workerDocuments = worker.documents
        ? JSON.parse(JSON.stringify(worker.documents))
        : {};

      switch (dto.documentType) {
        case 'document_front':
          if (dto.pictureId) {
            updateData = {
              documents: {
                ...workerDocuments, // Preserva os dados existentes
                rgFrontId: dto.pictureId,
              },
            };
          }
          break;
        case 'document_back':
          if (dto.pictureId) {
            updateData = {
              documents: {
                ...workerDocuments, // Preserva os dados existentes
                rgBackId: dto.pictureId,
              },
            };
          }
          break;
        case 't_shirt_selfie':
          if (dto.pictureId) {
            updateData = {
              documents: {
                ...workerDocuments, // Preserva os dados existentes
                tShirtSelfieId: dto.pictureId,
              },
            };
          }
          break;
        case 'profile':
          if (dto.pictureId) {
            await this.updateProfilePicture(dto.pictureId, dto.workerId);
          }
          break;
        default:
          throw new Error(
            `Tipo de documento desconhecido: ${dto.documentType}`,
          );
      }

      await this.workerRepository.update(dto.workerId, updateData);
    } catch (error) {
      throw error;
    }
  }

  private async updateProfilePicture(
    pictureId: string,
    workerId: string,
  ): Promise<void> {
    try {
      await this.userRepository.updateByWorkerId(workerId, {
        profilePictureId: pictureId,
      });
    } catch (error) {
      throw error;
    }
  }
}
