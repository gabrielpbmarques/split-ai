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
  OllamaEmbeddingsProvider,
  EMBEDDINGS,
} from 'src/infrastructure/providers/ollama-embeddings.provider';
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
  AnthropicProvider,
  ANTHROPIC_CHAT,
} from './providers/anthropic.provider';
import {
  BravohubAnalyticsProvider,
  BRAVOHUB_ANALYTICS_SERVICE,
} from './providers/bravohub-analytics.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    ...SupabaseProvider,
    ...OllamaEmbeddingsProvider,
    ...AnthropicProvider,
    ...SendGridProvider,
    ...GcpStorageProvider,
    ...GoogleVoiceProvider,
    ...TwilioProvider,
    ...SpiderServiceProvider,
    ...StripeProvider,
    ...BravohubAnalyticsProvider,
  ],
  exports: [
    SUPABASE_CLIENT,
    SUPABASE_SERVICE,
    EMBEDDINGS,
    ANTHROPIC_CHAT,
    SENDGRID_CLIENT,
    EMAIL_SERVICE,
    GCP_STORAGE_SERVICE,
    GOOGLE_VOICE_SERVICE,
    TWILIO_CLIENT,
    TWILIO_SERVICE,
    SPIDER_SERVICE,
    STRIPE_CLIENT,
    BRAVOHUB_ANALYTICS_SERVICE,
  ],
})
export class InfrastructureModule {}
