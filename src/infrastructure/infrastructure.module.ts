import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  GcpStorageProvider,
  GCP_STORAGE_SERVICE,
} from 'src/infrastructure/providers/gcp-storage.provider';
import {
  GoogleVoiceProvider,
  GOOGLE_VOICE_SERVICE,
} from 'src/infrastructure/providers/google-voice.provider';
import {
  SendGridProvider,
  SENDGRID_CLIENT,
  EMAIL_SERVICE,
} from 'src/infrastructure/providers/sendgrid.provider';
import {
  SupabaseProvider,
  SUPABASE_CLIENT,
  SUPABASE_SERVICE,
} from 'src/infrastructure/providers/supabase.provider';
import {
  TwilioProvider,
  TWILIO_CLIENT,
  TWILIO_SERVICE,
} from 'src/infrastructure/providers/twilio.provider';
import {
  VertexAIProvider,
  VERTEX_AI_EMBEDDINGS,
  VERTEX_AI_CHAT,
} from 'src/infrastructure/providers/vertex-ai.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    ...SupabaseProvider,
    ...VertexAIProvider,
    ...SendGridProvider,
    ...GcpStorageProvider,
    ...GoogleVoiceProvider,
    ...TwilioProvider,
  ],
  exports: [
    SUPABASE_CLIENT,
    SUPABASE_SERVICE,
    VERTEX_AI_EMBEDDINGS,
    VERTEX_AI_CHAT,
    SENDGRID_CLIENT,
    EMAIL_SERVICE,
    GCP_STORAGE_SERVICE,
    GOOGLE_VOICE_SERVICE,
    TWILIO_CLIENT,
    TWILIO_SERVICE,
  ],
})
export class InfrastructureModule {}
