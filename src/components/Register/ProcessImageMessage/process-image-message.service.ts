import { Inject, Injectable } from '@nestjs/common';
import {
  IS3Service,
  S3_SERVICE,
} from 'src/infrastructure/providers/s3.provider';
import axios from 'axios';
import { PictureRepository } from 'src/repositories/Picture.repository';
import { ImageType } from 'src/models/Picture.model';

export interface ProcessImageMessageDto {
  imageUrl: string;
  sessionId: string;
  imageType: 'profile' | 'document_front' | 'document_back' | 't_shirt_selfie';
}

export interface ProcessedImageResult {
  url: string;
  pictureId: string;
}

@Injectable()
export class ProcessImageMessageService {
  constructor(
    @Inject(S3_SERVICE) private readonly s3Service: IS3Service,
    private readonly pictureRepository: PictureRepository,
  ) {}

  /**
   * Processa uma imagem recebida via WhatsApp
   * @param dto Dados da imagem a ser processada
   * @returns Objeto contendo a URL da imagem no S3 e o ID do registro na collection de pictures
   */
  async execute(dto: ProcessImageMessageDto): Promise<ProcessedImageResult> {
    const folder = this.getFolderByImageType(dto.imageType);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; WhatsAppBot/1.0)',
    };

    const response = await axios.get(dto.imageUrl, {
      responseType: 'arraybuffer',
      headers,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    const extension = this.getExtensionFromContentType(contentType);

    const s3Url = await this.s3Service.uploadBuffer(
      Buffer.from(response.data),
      folder,
      extension,
      contentType,
    );

    const pictureType = this.mapImageTypeToModelType(dto.imageType);

    const picture = await this.pictureRepository.create({
      key: s3Url.split('/').pop() || `${Date.now()}.${extension}`, // Extrai o nome do arquivo da URL
      image: s3Url,
      type: pictureType,
    });

    return {
      url: s3Url,
      pictureId: picture._id.toString(),
    };
  }

  /**
   * Define a pasta no S3 com base no tipo de imagem
   * @param imageType Tipo de imagem
   * @returns Nome da pasta no S3
   */
  private getFolderByImageType(imageType: string): string {
    switch (imageType) {
      case 'profile':
        return 'profile-pictures';
      case 'document_front':
        return 'documents/front';
      case 'document_back':
        return 'documents/back';
      case 't_shirt_selfie':
        return 'documents/selfie';
      default:
        return 'others';
    }
  }

  /**
   * Determina a extensão do arquivo com base no tipo de conteúdo MIME
   * @param contentType Tipo de conteúdo MIME
   * @returns Extensão do arquivo sem o ponto
   */
  private getExtensionFromContentType(contentType: string): string {
    const contentTypeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
    };

    return contentTypeToExt[contentType] || 'jpg';
  }

  /**
   * Mapeia o tipo de imagem do WhatsApp para o tipo de imagem do modelo Picture
   * @param whatsappImageType Tipo de imagem do WhatsApp
   * @returns Tipo de imagem do modelo Picture
   */
  private mapImageTypeToModelType(whatsappImageType: string): ImageType {
    switch (whatsappImageType) {
      case 'profile':
        return ImageType.PROFILE;
      case 'document_front':
        return ImageType.DOCUMENT_FRONT;
      case 'document_back':
        return ImageType.DOCUMENT_BACK;
      case 't_shirt_selfie':
        return ImageType.T_SHIRT_SELFIE;
      default:
        return ImageType.PROFILE; // Valor padrão
    }
  }
}
