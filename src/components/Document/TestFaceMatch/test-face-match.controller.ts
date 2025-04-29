import { Body, Controller, Post } from '@nestjs/common';
import { TestFaceMatchDto } from './test-face-match.dto';
import { TestFaceMatchService } from './test-face-match.service';

@Controller('test-face-match')
export class TestFaceMatchController {
  constructor(private readonly testFaceMatchService: TestFaceMatchService) {}

  /**
   * Endpoint para testar a comparação facial entre uma imagem de documento e uma selfie
   * @param testFaceMatchDto DTO com as URLs das imagens
   * @returns Resultado da comparação facial
   */
  @Post()
  async testFaceMatch(@Body() testFaceMatchDto: TestFaceMatchDto) {
    const { documentImageUrl, selfieImageUrl } = testFaceMatchDto;
    return this.testFaceMatchService.compareFaces(
      documentImageUrl,
      selfieImageUrl,
    );
  }
}
