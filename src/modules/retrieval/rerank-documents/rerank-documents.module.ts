import { Module } from '@nestjs/common';

import { VoyageRerankProviderModule } from 'src/infrastructure/voyage-rerank/voyage-rerank.provider.module';
import { RerankDocumentsService } from 'src/modules/retrieval/rerank-documents/rerank-documents.service';

@Module({
  imports: [VoyageRerankProviderModule],
  providers: [RerankDocumentsService],
  exports: [RerankDocumentsService],
})
export class RerankDocumentsModule {}
