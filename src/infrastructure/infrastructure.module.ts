import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  SupabaseProvider,
  SUPABASE_CLIENT,
} from 'src/infrastructure/providers/supabase.provider';
import {
  VertexAIProvider,
  VERTEX_AI_EMBEDDINGS,
  VERTEX_AI_CHAT,
} from 'src/infrastructure/providers/vertex-ai.provider';
import {
  S3Provider,
  S3_CLIENT,
  S3_SERVICE,
} from 'src/infrastructure/providers/s3.provider';
import {
  SendGridProvider,
  SENDGRID_CLIENT,
  EMAIL_SERVICE,
} from 'src/infrastructure/providers/sendgrid.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    SupabaseProvider,
    ...VertexAIProvider,
    ...S3Provider,
    ...SendGridProvider,
  ],
  exports: [
    SUPABASE_CLIENT,
    VERTEX_AI_EMBEDDINGS,
    VERTEX_AI_CHAT,
    S3_CLIENT,
    S3_SERVICE,
    SENDGRID_CLIENT,
    EMAIL_SERVICE,
  ],
})
export class InfrastructureModule {}
