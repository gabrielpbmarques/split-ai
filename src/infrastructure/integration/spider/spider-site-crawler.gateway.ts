import { SpiderLoader } from '@langchain/community/document_loaders/web/spider';
import { BadGatewayException, Logger } from '@nestjs/common';

import {
  type IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import type {
  CrawledPage,
  CrawlOptions,
  SiteCrawler,
} from 'src/infrastructure/integration/site-crawler.port';
import { spiderDocumentSchema } from 'src/infrastructure/integration/spider/spider.contracts';
import { mapSpiderDocument } from 'src/infrastructure/integration/spider/spider.mappers';
import { env } from 'src/shared/config/env';

export class SpiderSiteCrawlerGateway implements SiteCrawler {
  readonly name = 'spider';

  private readonly logger = new Logger(SpiderSiteCrawlerGateway.name);

  state(): IntegrationState {
    return env.SPIDER_API_KEY ? 'READY' : 'NOT_CONFIGURED';
  }

  async crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]> {
    if (!env.SPIDER_API_KEY) {
      notConfigured(this.name);
    }

    const loader = new SpiderLoader({
      apiKey: env.SPIDER_API_KEY,
      url,
      params: {
        limit: options.limit,
        depth: options.depth,
        metadata: true,
        readability: true,
        return_format: 'text',
      },
    });

    const documents = await loader.load();
    const pages: CrawledPage[] = [];

    for (const document of documents) {
      const parsed = spiderDocumentSchema.safeParse(document);

      if (!parsed.success) {
        this.logger.warn(
          { url, issues: parsed.error.issues },
          'spider.invalid_document',
        );
        continue;
      }

      pages.push(mapSpiderDocument(parsed.data));
    }

    if (documents.length > 0 && pages.length === 0) {
      throw new BadGatewayException(
        'Resposta inválida do serviço de rastreamento',
      );
    }

    return pages;
  }
}
