import { Global, Module } from '@nestjs/common';

import { InfrastructureHealthIndicator } from 'src/infrastructure/infrastructure.health';
import {
  AnthropicProvider,
  CHAT_MODEL_SERVICE,
} from 'src/infrastructure/providers/anthropic.provider';
import {
  GCP_STORAGE_SERVICE,
  GcpStorageProvider,
} from 'src/infrastructure/providers/gcp-storage.provider';
import {
  GOOGLE_VISION_SERVICE,
  GoogleVisionProvider,
} from 'src/infrastructure/providers/google-vision.provider';
import {
  SPIDER_SERVICE,
  SpiderProvider,
} from 'src/infrastructure/providers/spider.provider';
import {
  SUPABASE_CLIENT,
  SupabaseProvider,
  VECTOR_STORE_SERVICE,
} from 'src/infrastructure/providers/supabase.provider';
import {
  TEXT_TO_SPEECH_SERVICE,
  TextToSpeechProvider,
} from 'src/infrastructure/providers/text-to-speech.provider';
import {
  TWILIO_CLIENT,
  TWILIO_SERVICE,
  TwilioProvider,
} from 'src/infrastructure/providers/twilio.provider';
import {
  EMBEDDINGS_SERVICE,
  RERANKER_SERVICE,
  VoyageProvider,
} from 'src/infrastructure/providers/voyage.provider';

@Global()
@Module({
  providers: [
    ...AnthropicProvider,
    ...VoyageProvider,
    ...SupabaseProvider,
    ...TwilioProvider,
    ...GcpStorageProvider,
    ...GoogleVisionProvider,
    ...TextToSpeechProvider,
    ...SpiderProvider,
    InfrastructureHealthIndicator,
  ],
  exports: [
    CHAT_MODEL_SERVICE,
    EMBEDDINGS_SERVICE,
    RERANKER_SERVICE,
    SUPABASE_CLIENT,
    VECTOR_STORE_SERVICE,
    TWILIO_CLIENT,
    TWILIO_SERVICE,
    GCP_STORAGE_SERVICE,
    GOOGLE_VISION_SERVICE,
    TEXT_TO_SPEECH_SERVICE,
    SPIDER_SERVICE,
    InfrastructureHealthIndicator,
  ],
})
export class InfrastructureModule {}
