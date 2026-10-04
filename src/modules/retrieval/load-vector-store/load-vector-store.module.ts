import { Module } from '@nestjs/common';

import { SupabaseProviderModule } from 'src/infrastructure/supabase/supabase.provider.module';
import { VoyageEmbeddingsProviderModule } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.provider.module';
import { LoadVectorStoreService } from 'src/modules/retrieval/load-vector-store/load-vector-store.service';

@Module({
  imports: [SupabaseProviderModule, VoyageEmbeddingsProviderModule],
  providers: [LoadVectorStoreService],
  exports: [LoadVectorStoreService],
})
export class LoadVectorStoreModule {}
