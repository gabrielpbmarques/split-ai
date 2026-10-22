import { SpiderLoader } from '@langchain/community/document_loaders/web/spider';
import {
  BadGatewayException,
  Logger,
  type Provider,
  ServiceUnavailableException,
} from '@nestjs/common';
import { z } from 'zod';

import { env } from 'src/shared/config/env';

export const SPIDER_SERVICE = 'SPIDER_SERVICE';
export const SITE_CRAWLER_SERVICE = SPIDER_SERVICE;

export interface CrawlOptions {
  readonly limit: number;
  readonly depth?: number;
}

export interface CrawledPage {
  readonly content: string;
  readonly url?: string;
  readonly title?: string;
  readonly metadata: Record<string, unknown>;
}

export interface ISpiderService {
  crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]>;
}

export const spiderDocumentSchema = z.object({
  pageContent: z.string(),
  metadata: z.record(z.any(), z.any()).default({}),
});

export type SpiderDocument = z.infer<typeof spiderDocumentSchema>;

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function mapSpiderDocument(document: SpiderDocument): CrawledPage {
  return {
    content: document.pageContent,
    url: optionalString(document.metadata.url),
    title: optionalString(document.metadata.title),
    metadata: document.metadata,
  };
}

class SpiderService implements ISpiderService {
  private readonly logger = new Logger(SpiderService.name);

  async crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]> {
    if (!env.SPIDER_API_KEY) {
      throw new ServiceUnavailableException('Spider não configurado');
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

class MockSpiderService implements ISpiderService {
  async crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]> {
    return [
      {
        content: `Conteúdo simulado de ${url}`,
        url,
        title: 'Página simulada',
        metadata: { url, depth: 0, limit: options.limit },
      },
    ];
  }
}

export const SpiderProvider: Provider[] = [
  {
    provide: SPIDER_SERVICE,
    useFactory: (): ISpiderService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockSpiderService();
      }
      return new SpiderService();
    },
  },
];
