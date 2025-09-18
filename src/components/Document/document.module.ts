import { Module } from '@nestjs/common';
import { DocumentValidationModule } from 'src/components/Document/DocumentValidation/document-validation.module';
import { ValidateWorkersDocumentsModule } from 'src/components/Document/Crons/ValidateWorkersDocuments/validate-workers-documents.module';

@Module({
  imports: [DocumentValidationModule, ValidateWorkersDocumentsModule],
  exports: [DocumentValidationModule, ValidateWorkersDocumentsModule],
})
export class DocumentModule {}
