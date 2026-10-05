import { Global, Module, type Provider } from '@nestjs/common';

import { AnthropicChatModelFactory } from 'src/infrastructure/integration/anthropic/anthropic-chat-model.factory';
import {
  CHAT_MODEL,
  type ChatModelFactory,
} from 'src/infrastructure/integration/chat-model.port';
import { TypeOrmCustomerDatabaseGateway } from 'src/infrastructure/integration/customer-database/customer-database.gateway';
import {
  CUSTOMER_DATABASE,
  type CustomerDatabaseGateway,
} from 'src/infrastructure/integration/customer-database.port';
import { ElevenLabsTextToSpeechGateway } from 'src/infrastructure/integration/eleven-labs/eleven-labs-text-to-speech.gateway';
import {
  EMBEDDINGS,
  type EmbeddingsGateway,
} from 'src/infrastructure/integration/embeddings.port';
import {
  FILE_STORAGE,
  type FileStorage,
} from 'src/infrastructure/integration/file-storage.port';
import { GcsFileStorageGateway } from 'src/infrastructure/integration/google/gcs-file-storage.gateway';
import { GoogleTextToSpeechGateway } from 'src/infrastructure/integration/google/google-text-to-speech.gateway';
import { GoogleVisionOcrGateway } from 'src/infrastructure/integration/google/google-vision-ocr.gateway';
import { IntegrationHealthIndicator } from 'src/infrastructure/integration/integration.health';
import {
  MESSAGING,
  type MessagingGateway,
} from 'src/infrastructure/integration/messaging.port';
import { MockChatModelFactory } from 'src/infrastructure/integration/mock/mock-chat-model.factory';
import { MockCustomerDatabaseGateway } from 'src/infrastructure/integration/mock/mock-customer-database.gateway';
import { MockEmbeddings } from 'src/infrastructure/integration/mock/mock-embeddings';
import { MockFileStorageGateway } from 'src/infrastructure/integration/mock/mock-file-storage.gateway';
import { MockMessagingGateway } from 'src/infrastructure/integration/mock/mock-messaging.gateway';
import { MockOcrGateway } from 'src/infrastructure/integration/mock/mock-ocr.gateway';
import { MockRerankerGateway } from 'src/infrastructure/integration/mock/mock-reranker.gateway';
import { MockSiteCrawlerGateway } from 'src/infrastructure/integration/mock/mock-site-crawler.gateway';
import { MockTextToSpeechGateway } from 'src/infrastructure/integration/mock/mock-text-to-speech.gateway';
import { MockVectorStoreGateway } from 'src/infrastructure/integration/mock/mock-vector-store.gateway';
import { OCR, type OcrReader } from 'src/infrastructure/integration/ocr.port';
import {
  RERANKER,
  type RerankerGateway,
} from 'src/infrastructure/integration/reranker.port';
import {
  SITE_CRAWLER,
  type SiteCrawler,
} from 'src/infrastructure/integration/site-crawler.port';
import { SpiderSiteCrawlerGateway } from 'src/infrastructure/integration/spider/spider-site-crawler.gateway';
import { SupabaseVectorStoreGateway } from 'src/infrastructure/integration/supabase/supabase-vector-store.gateway';
import {
  TEXT_TO_SPEECH,
  type TextToSpeech,
} from 'src/infrastructure/integration/text-to-speech.port';
import { TwilioMessagingGateway } from 'src/infrastructure/integration/twilio/twilio-messaging.gateway';
import { VECTOR_STORE } from 'src/infrastructure/integration/vector-store.port';
import { createVoyageEmbeddings } from 'src/infrastructure/integration/voyage/voyage-embeddings.factory';
import { VoyageRerankerGateway } from 'src/infrastructure/integration/voyage/voyage-reranker.gateway';
import { env } from 'src/shared/config/env';

const isMock = (): boolean => env.INTEGRATION_MODE === 'mock';

function select<T>(live: () => T, mock: () => T): () => T {
  return () => (isMock() ? mock() : live());
}

function textToSpeechLive():
  | GoogleTextToSpeechGateway
  | ElevenLabsTextToSpeechGateway {
  return env.TTS_PROVIDER === 'elevenlabs'
    ? new ElevenLabsTextToSpeechGateway()
    : new GoogleTextToSpeechGateway();
}

const providers: Provider[] = [
  {
    provide: MESSAGING,
    useFactory: select<MessagingGateway>(
      () => new TwilioMessagingGateway(),
      () => new MockMessagingGateway(),
    ),
  },
  {
    provide: EMBEDDINGS,
    useFactory: select<EmbeddingsGateway>(
      () => createVoyageEmbeddings(),
      () => new MockEmbeddings(),
    ),
  },
  {
    provide: VECTOR_STORE,
    useFactory: (embeddings: EmbeddingsGateway) =>
      isMock()
        ? new MockVectorStoreGateway(embeddings)
        : new SupabaseVectorStoreGateway(embeddings),
    inject: [EMBEDDINGS],
  },
  {
    provide: RERANKER,
    useFactory: select<RerankerGateway>(
      () => new VoyageRerankerGateway(),
      () => new MockRerankerGateway(),
    ),
  },
  {
    provide: CHAT_MODEL,
    useFactory: select<ChatModelFactory>(
      () => new AnthropicChatModelFactory(),
      () => new MockChatModelFactory(),
    ),
  },
  {
    provide: SITE_CRAWLER,
    useFactory: select<SiteCrawler>(
      () => new SpiderSiteCrawlerGateway(),
      () => new MockSiteCrawlerGateway(),
    ),
  },
  {
    provide: FILE_STORAGE,
    useFactory: select<FileStorage>(
      () => new GcsFileStorageGateway(),
      () => new MockFileStorageGateway(),
    ),
  },
  {
    provide: TEXT_TO_SPEECH,
    useFactory: select<TextToSpeech>(
      textToSpeechLive,
      () => new MockTextToSpeechGateway(),
    ),
  },
  {
    provide: OCR,
    useFactory: select<OcrReader>(
      () => new GoogleVisionOcrGateway(),
      () => new MockOcrGateway(),
    ),
  },
  {
    provide: CUSTOMER_DATABASE,
    useFactory: select<CustomerDatabaseGateway>(
      () => new TypeOrmCustomerDatabaseGateway(),
      () => new MockCustomerDatabaseGateway(),
    ),
  },
  IntegrationHealthIndicator,
];

@Global()
@Module({
  providers,
  exports: [
    MESSAGING,
    EMBEDDINGS,
    VECTOR_STORE,
    RERANKER,
    CHAT_MODEL,
    SITE_CRAWLER,
    FILE_STORAGE,
    TEXT_TO_SPEECH,
    OCR,
    CUSTOMER_DATABASE,
    IntegrationHealthIndicator,
  ],
})
export class IntegrationModule {}
