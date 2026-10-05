import { Inject, Injectable } from '@nestjs/common';

import { CHAT_MODEL } from 'src/infrastructure/integration/chat-model.port';
import { CUSTOMER_DATABASE } from 'src/infrastructure/integration/customer-database.port';
import { FILE_STORAGE } from 'src/infrastructure/integration/file-storage.port';
import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';
import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { MESSAGING } from 'src/infrastructure/integration/messaging.port';
import { OCR } from 'src/infrastructure/integration/ocr.port';
import { RERANKER } from 'src/infrastructure/integration/reranker.port';
import { SITE_CRAWLER } from 'src/infrastructure/integration/site-crawler.port';
import { TEXT_TO_SPEECH } from 'src/infrastructure/integration/text-to-speech.port';
import { VECTOR_STORE } from 'src/infrastructure/integration/vector-store.port';

export type IntegrationHealthReport = Readonly<
  Record<string, IntegrationState>
>;

@Injectable()
export class IntegrationHealthIndicator {
  private readonly gateways: readonly IntegrationGateway[];

  constructor(
    @Inject(MESSAGING) messaging: IntegrationGateway,
    @Inject(VECTOR_STORE) vectorStore: IntegrationGateway,
    @Inject(RERANKER) reranker: IntegrationGateway,
    @Inject(CHAT_MODEL) chatModel: IntegrationGateway,
    @Inject(SITE_CRAWLER) siteCrawler: IntegrationGateway,
    @Inject(FILE_STORAGE) fileStorage: IntegrationGateway,
    @Inject(TEXT_TO_SPEECH) textToSpeech: IntegrationGateway,
    @Inject(OCR) ocr: IntegrationGateway,
    @Inject(CUSTOMER_DATABASE) customerDatabase: IntegrationGateway,
  ) {
    this.gateways = [
      messaging,
      vectorStore,
      reranker,
      chatModel,
      siteCrawler,
      fileStorage,
      textToSpeech,
      ocr,
      customerDatabase,
    ];
  }

  check(): IntegrationHealthReport {
    return Object.fromEntries(
      this.gateways.map((gateway) => [gateway.name, gateway.state()]),
    );
  }
}
