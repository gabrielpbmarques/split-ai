import { Controller, Post, Body } from '@nestjs/common';
import { DocumentValidationService } from './document-validation.service';
import { DocumentValidationMessage } from './document-validation.dto';

@Controller('document')
export class DocumentValidationController {
  constructor(
    private readonly documentValidationService: DocumentValidationService,
  ) {}

  @Post('validate')
  async execute(@Body() payload: DocumentValidationMessage): Promise<any> {
    return await this.documentValidationService.execute(payload);
  }
}
