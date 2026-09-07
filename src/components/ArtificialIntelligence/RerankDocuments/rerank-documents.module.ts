import { Module } from '@nestjs/common';
import { VoyageRerankProviderModule } from 'src/infrastructure/providers/voyage-rerank.provider.module';

import { RerankDocumentsService } from './rerank-documents.service';

@Module({
  imports: [VoyageRerankProviderModule],
  providers: [RerankDocumentsService],
  exports: [RerankDocumentsService],
})
export class RerankDocumentsModule {}
