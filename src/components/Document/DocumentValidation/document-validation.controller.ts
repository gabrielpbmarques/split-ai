import { Controller, Post, Body } from '@nestjs/common';
import { DocumentValidationService } from 'src/components/Document/DocumentValidation/document-validation.service';
import { DocumentValidationMessage } from 'src/components/Document/DocumentValidation/document-validation.dto';

@Controller('document')
export class DocumentValidationController {
  constructor(
    private readonly documentValidationService: DocumentValidationService,
  ) {}

  @Post('validate')
  async execute(@Body() payload: DocumentValidationMessage): Promise<any> {
    try {
      const result = await this.documentValidationService.execute(payload);

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao validar documentos',
        error: error.message,
      };
    }
  }
}
