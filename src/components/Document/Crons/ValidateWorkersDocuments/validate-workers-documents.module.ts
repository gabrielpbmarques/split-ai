import { Module } from '@nestjs/common';
import { ValidateWorkersDocumentsService } from './validate-workers-documents.service';
import { ValidateWorkersDocumentsController } from './validate-workers-documents.controller';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { DocumentValidationModule } from 'src/components/Document/DocumentValidation/document-validation.module';

@Module({
  imports: [RepositoriesModule, DocumentValidationModule],
  providers: [ValidateWorkersDocumentsService],
  controllers: [ValidateWorkersDocumentsController],
})
export class ValidateWorkersDocumentsModule {}
