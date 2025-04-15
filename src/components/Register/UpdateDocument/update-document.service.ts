import { Injectable, Logger } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { ObjectId } from 'mongoose';

export interface UpdateDocumentDto {
  workerId: string;
  documentType: 'profile' | 'document_front' | 'document_back' | 'selfie';
  imageUrl: string;
  pictureId?: string; // ID da imagem na collection de pictures
}

@Injectable()
export class UpdateDocumentService {
  private readonly logger = new Logger(UpdateDocumentService.name);

  constructor(private readonly workerRepository: WorkerRepository) {}

  /**
   * Atualiza os documentos do worker com a URL da imagem
   * @param dto Dados do documento a ser atualizado
   */
  async execute(dto: UpdateDocumentDto): Promise<void> {
    this.logger.log(
      `Atualizando documento ${dto.documentType} para o worker ${dto.workerId}`,
    );

    try {
      // Busca o worker para verificar se já tem documentos
      const worker = await this.workerRepository.findById(dto.workerId);

      if (!worker) {
        throw new Error(`Worker não encontrado com ID: ${dto.workerId}`);
      }

      // Prepara o objeto de atualização com base no tipo de documento
      const updateData: any = {};

      // Se não existir um objeto documents, cria um novo
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

      // Atualiza o campo específico com base no tipo de documento
      switch (dto.documentType) {
        case 'profile':
          updateData['profilePicture'] = dto.imageUrl;
          // Se tiver o ID da imagem, atualiza o campo profilePictureId
          if (dto.pictureId) {
            updateData['profilePictureId'] = dto.pictureId;
          }
          break;
        case 'document_front':
          // Atualiza apenas se tiver o ID da imagem
          if (dto.pictureId) {
            updateData['documents.rgFrontId'] = dto.pictureId;
          }
          updateData['documents.rgFrontUrl'] = dto.imageUrl;
          break;
        case 'document_back':
          // Atualiza apenas se tiver o ID da imagem
          if (dto.pictureId) {
            updateData['documents.rgBackId'] = dto.pictureId;
          }
          updateData['documents.rgBackUrl'] = dto.imageUrl;
          break;
        case 'selfie':
          // Atualiza apenas se tiver o ID da imagem
          if (dto.pictureId) {
            updateData['documents.tShirtSelfieId'] = dto.pictureId;
          }
          updateData['documents.tShirtSelfieUrl'] = dto.imageUrl;
          break;
      }

      // Atualiza o worker
      await this.workerRepository.update(dto.workerId, updateData);

      // Atualiza o estágio de cadastro se necessário
      if (dto.documentType === 'profile') {
        await this.updateSignupStage(dto.workerId, 'profile_picture');
      } else if (dto.documentType === 'selfie') {
        // Se a selfie foi enviada, assumimos que todos os documentos foram enviados
        await this.updateSignupStage(dto.workerId, 'document');
      }

      this.logger.log(
        `Documento ${dto.documentType} atualizado com sucesso para o worker ${dto.workerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar documento: ${error.message}`,
        error.stack,
      );
      throw error;
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
    try {
      await this.workerRepository.update(workerId, { signupStage: stage });
      this.logger.log(`Estágio de cadastro atualizado para ${stage}`);
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar estágio de cadastro: ${error.message}`,
        error.stack,
      );
      // Não lançamos o erro para não interromper o fluxo principal
    }
  }
}
