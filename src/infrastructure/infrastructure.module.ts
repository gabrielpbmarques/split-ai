import { Module } from '@nestjs/common';
import {
  SupabaseProvider,
  SUPABASE_CLIENT,
} from 'src/infrastructure/providers/supabase.provider';
import {
  VertexAIProvider,
  VERTEX_AI_EMBEDDINGS,
  VERTEX_AI_CHAT,
} from 'src/infrastructure/providers/vertex-ai.provider';

@Module({
  providers: [SupabaseProvider, ...VertexAIProvider],
  exports: [SUPABASE_CLIENT, VERTEX_AI_EMBEDDINGS, VERTEX_AI_CHAT],
})
export class InfrastructureModule {}
