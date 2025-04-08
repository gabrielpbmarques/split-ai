import { Module } from '@nestjs/common';
import {
  SupabaseProvider,
  SUPABASE_CLIENT,
} from './providers/supabase.provider';
import {
  VertexAIProvider,
  VERTEX_AI_EMBEDDINGS,
  VERTEX_AI_CHAT,
} from './providers/vertex-ai.provider';

@Module({
  providers: [SupabaseProvider, VertexAIProvider],
  exports: [SupabaseProvider, VertexAIProvider],
})
export class InfrastructureModule {}
