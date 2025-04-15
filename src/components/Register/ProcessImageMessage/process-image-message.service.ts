import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IS3Service,
  S3_SERVICE,
} from 'src/infrastructure/providers/s3.provider';
import axios from 'axios';

export interface ProcessImageMessageDto {
  imageUrl: string;
  sessionId: string;
  imageType: 'profile' | 'document_front' | 'document_back' | 'selfie';
}

@Injectable()
export class ProcessImageMessageService {
  private readonly logger = new Logger(ProcessImageMessageService.name);

  constructor(@Inject(S3_SERVICE) private readonly s3Service: IS3Service) {}

  /**
   * Processa uma imagem recebida via WhatsApp
   * @param dto Dados da imagem a ser processada
   * @returns URL da imagem no S3
   */
  async execute(dto: ProcessImageMessageDto): Promise<string> {
    this.logger.log(
      `Processando imagem do tipo ${dto.imageType} para a sessão ${dto.sessionId}`,
    );

    try {
      // Define a pasta com base no tipo de imagem
      const folder = this.getFolderByImageType(dto.imageType);

      // Adiciona cabeçalhos específicos para acessar URLs do WhatsApp, se necessário
      const headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsAppBot/1.0)',
      };

      // Faz download da imagem da URL do WhatsApp antes que expire
      const response = await axios.get(dto.imageUrl, {
        responseType: 'arraybuffer',
        headers,
      });

      // Verifica o tipo de conteúdo para determinar a extensão correta
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const extension = this.getExtensionFromContentType(contentType);

      // Faz upload da imagem para o S3
      const s3Url = await this.s3Service.uploadBuffer(
        Buffer.from(response.data),
        folder,
        extension,
        contentType,
      );

      this.logger.log(`Imagem do WhatsApp processada com sucesso: ${s3Url}`);
      return s3Url;
    } catch (error) {
      this.logger.error(
        `Erro ao processar imagem do WhatsApp: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
      case 'selfie':
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
}
