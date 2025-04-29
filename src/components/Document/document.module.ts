import { Module } from '@nestjs/common';
import { DocumentValidationModule } from 'src/components/Document/DocumentValidation/document-validation.module';
import { ExtractOcrTextModule } from 'src/components/Document/ExtractOcrText/extract-ocr-text.module';

@Module({
  imports: [DocumentValidationModule, ExtractOcrTextModule],
  exports: [DocumentValidationModule, ExtractOcrTextModule],
})
export class DocumentModule {}
