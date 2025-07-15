import { Module } from '@nestjs/common';
import { ValidateWorkersDocumentsModule } from './ValidateWorkersDocuments/validate-workers-documents.module';

@Module({
  imports: [ValidateWorkersDocumentsModule],
  exports: [ValidateWorkersDocumentsModule],
})
export class CronModule {}
