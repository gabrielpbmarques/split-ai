import { Module } from '@nestjs/common';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';
import { VoyageEmbeddingsProviderModule } from 'src/infrastructure/providers/voyage-embeddings.provider.module';

import { LoadVectorStoreService } from './load-vector-store.service';

@Module({
  imports: [SupabaseProviderModule, VoyageEmbeddingsProviderModule],
  providers: [LoadVectorStoreService],
  exports: [LoadVectorStoreService],
})
export class LoadVectorStoreModule {}
