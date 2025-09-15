import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  SupabaseProvider,
  SUPABASE_CLIENT,
  SUPABASE_SERVICE,
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
import {
  AnthorProvider,
  ANTHOR_CLIENT,
} from 'src/infrastructure/providers/anthor.provider';
import {
  KafkaProvider,
  KAFKA_CLIENT,
  KAFKA_SERVICE,
} from 'src/infrastructure/providers/kafka.provider';
import {
  GcpStorageProvider,
  GCP_STORAGE_SERVICE,
} from 'src/infrastructure/providers/gcp-storage.provider';
import {
  GoogleVoiceProvider,
  GOOGLE_VOICE_SERVICE,
} from 'src/infrastructure/providers/google-voice.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AnthorProvider,
    ...SupabaseProvider,
    ...VertexAIProvider,
    ...S3Provider,
    ...SendGridProvider,
    ...KafkaProvider,
    ...GcpStorageProvider,
    ...GoogleVoiceProvider,
  ],
  exports: [
    SUPABASE_CLIENT,
    SUPABASE_SERVICE,
    VERTEX_AI_EMBEDDINGS,
    VERTEX_AI_CHAT,
    S3_CLIENT,
    S3_SERVICE,
    SENDGRID_CLIENT,
    EMAIL_SERVICE,
    ANTHOR_CLIENT,
    KAFKA_CLIENT,
    KAFKA_SERVICE,
    GCP_STORAGE_SERVICE,
    GOOGLE_VOICE_SERVICE,
  ],
})
export class InfrastructureModule {}
