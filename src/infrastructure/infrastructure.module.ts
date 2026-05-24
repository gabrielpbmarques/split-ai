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
  SpiderServiceProvider,
  SPIDER_SERVICE,
} from 'src/infrastructure/providers/spider.provider';
import {
  StripeProvider,
  STRIPE_CLIENT,
} from 'src/infrastructure/providers/stripe.provider';
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
  VoyageEmbeddingsProvider,
  VOYAGE_EMBEDDINGS,
} from 'src/infrastructure/providers/voyage-embeddings.provider';

import {
  AnthropicProvider,
  ANTHROPIC_CHAT,
} from './providers/anthropic.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    ...SupabaseProvider,
    ...VoyageEmbeddingsProvider,
    ...AnthropicProvider,
    ...SendGridProvider,
    ...GcpStorageProvider,
    ...GoogleVoiceProvider,
    ...TwilioProvider,
    ...SpiderServiceProvider,
    ...StripeProvider,
  ],
  exports: [
    SUPABASE_CLIENT,
    SUPABASE_SERVICE,
    VOYAGE_EMBEDDINGS,
    ANTHROPIC_CHAT,
    SENDGRID_CLIENT,
    EMAIL_SERVICE,
    GCP_STORAGE_SERVICE,
    GOOGLE_VOICE_SERVICE,
    TWILIO_CLIENT,
    TWILIO_SERVICE,
    SPIDER_SERVICE,
    STRIPE_CLIENT,
  ],
})
export class InfrastructureModule {}
