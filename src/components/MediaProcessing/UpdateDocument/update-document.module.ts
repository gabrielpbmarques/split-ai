import { Module } from '@nestjs/common';
import { UpdateDocumentService } from './update-document.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdateDocumentService],
  exports: [UpdateDocumentService],
})
export class UpdateDocumentModule {}
