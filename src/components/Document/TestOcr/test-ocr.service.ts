import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TestOcrDto } from './test-ocr.dto';
import { ExtractOcrTextService } from '../ExtractOcrText/extract-ocr-text.service';
import axios from 'axios';

@Injectable()
export class TestOcrService {
  private readonly logger = new Logger(TestOcrService.name);

  constructor(private readonly extractOcrTextService: ExtractOcrTextService) {}

  async extractOcrFromUrls(testOcrDto: TestOcrDto) {
    try {
      const { frontImageUrl, backImageUrl } = testOcrDto;

      // Download das imagens
      this.logger.log(`Baixando imagem frente: ${frontImageUrl}`);
      const frontImageBuffer = await this.downloadImage(frontImageUrl);

      this.logger.log(`Baixando imagem verso: ${backImageUrl}`);
      const backImageBuffer = await this.downloadImage(backImageUrl);

      // Processamento OCR
      this.logger.log('Iniciando processamento de OCR');
      const result = await this.extractOcrTextService.execute(
        frontImageBuffer,
        backImageBuffer,
      );

      return {
        success: true,
        data: result,
        message: 'Dados extraídos com sucesso',
      };
    } catch (error) {
      this.logger.error('Erro ao processar imagens para OCR', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erro ao processar imagens para OCR',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      this.logger.error(`Erro ao baixar imagem: ${url}`, error);
      throw new Error(`Não foi possível baixar a imagem: ${error.message}`);
    }
  }
}
