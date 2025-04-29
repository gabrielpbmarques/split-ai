import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { FaceMatchService } from 'src/components/Document/FaceMatch/face-match.service';

@Injectable()
export class TestFaceMatchService {
  private readonly logger = new Logger(TestFaceMatchService.name);

  constructor(private readonly faceMatchService: FaceMatchService) {}

  /**
   * Compara uma imagem de documento com uma selfie para verificar se são da mesma pessoa
   * @param documentImageUrl URL da imagem do documento
   * @param selfieImageUrl URL da selfie
   * @returns Resultado da comparação facial
   */
  async compareFaces(documentImageUrl: string, selfieImageUrl: string) {
    try {
      this.logger.log(`Baixando imagem do documento: ${documentImageUrl}`);
      const documentImageBuffer = await this.downloadImage(documentImageUrl);

      this.logger.log(`Baixando imagem da selfie: ${selfieImageUrl}`);
      const selfieImageBuffer = await this.downloadImage(selfieImageUrl);

      this.logger.log('Iniciando comparação facial');
      const result = await this.faceMatchService.compareFaces(
        documentImageBuffer,
        selfieImageBuffer,
      );

      const enhancedResult = {
        ...result,
        details: undefined,
      };

      this.logger.log(
        `Resultado da comparação: ${JSON.stringify(enhancedResult)}`,
      );
      return enhancedResult;
    } catch (error) {
      this.logger.error(`Erro ao comparar faces: ${error.message}`);
      throw error;
    }
  }

  /**
   * Baixa uma imagem a partir de uma URL
   * @param imageUrl URL da imagem
   * @returns Buffer da imagem
   */
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      this.logger.error(
        `Erro ao baixar imagem de ${imageUrl}: ${error.message}`,
      );
      throw new Error(`Falha ao baixar imagem: ${error.message}`);
    }
  }
}
