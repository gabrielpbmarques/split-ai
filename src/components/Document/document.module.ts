import { Module } from '@nestjs/common';
import { DocumentValidationModule } from 'src/components/Document/DocumentValidation/document-validation.module';
import { ExtractOcrTextModule } from 'src/components/Document/ExtractOcrText/extract-ocr-text.module';
import { ValidateWorkersDocumentsModule } from 'src/components/Document/Crons/ValidateWorkersDocuments/validate-workers-documents.module';

@Module({
  imports: [
    DocumentValidationModule,
    ExtractOcrTextModule,
    ValidateWorkersDocumentsModule,
  ],
  exports: [
    DocumentValidationModule,
    ExtractOcrTextModule,
    ValidateWorkersDocumentsModule,
  ],
})
export class DocumentModule {}
