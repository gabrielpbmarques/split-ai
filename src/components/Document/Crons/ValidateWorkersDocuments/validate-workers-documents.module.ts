import { Module } from '@nestjs/common';
import { ValidateWorkersDocumentsService } from './validate-workers-documents.service';
import { ValidateWorkersDocumentsController } from './validate-workers-documents.controller';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [ValidateWorkersDocumentsService],
  controllers: [ValidateWorkersDocumentsController],
})
export class ValidateWorkersDocumentsModule {}
