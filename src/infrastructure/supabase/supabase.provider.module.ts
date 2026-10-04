import { Module } from '@nestjs/common';

import { SupabaseProvider } from 'src/infrastructure/supabase/supabase.provider';
import {
  SUPABASE_CLIENT,
  SUPABASE_SERVICE,
} from 'src/infrastructure/supabase/supabase.tokens';
import { VoyageEmbeddingsProviderModule } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.provider.module';

@Module({
  imports: [VoyageEmbeddingsProviderModule],
  providers: [...SupabaseProvider],
  exports: [SUPABASE_CLIENT, SUPABASE_SERVICE],
})
export class SupabaseProviderModule {}
