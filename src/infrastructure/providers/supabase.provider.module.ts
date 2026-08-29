import { Module } from '@nestjs/common';

import {
  SupabaseProvider,
  SUPABASE_CLIENT,
  SUPABASE_SERVICE,
} from './supabase.provider';
import { VoyageEmbeddingsProviderModule } from './voyage-embeddings.provider.module';

@Module({
  imports: [VoyageEmbeddingsProviderModule],
  providers: [...SupabaseProvider],
  exports: [SUPABASE_CLIENT, SUPABASE_SERVICE],
})
export class SupabaseProviderModule {}
