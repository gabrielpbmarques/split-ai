import { Module } from '@nestjs/common';
import { DocumentValidationModule } from './DocumentValidation/document-validation.module';
import { ExtractOcrTextModule } from './ExtractOcrText/extract-ocr-text.module';

@Module({
  imports: [DocumentValidationModule, ExtractOcrTextModule],
  exports: [DocumentValidationModule, ExtractOcrTextModule],
})
export class DocumentModule {}
