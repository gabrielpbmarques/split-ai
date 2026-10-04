import { SpiderLoader } from '@langchain/community/document_loaders/web/spider';
import { Provider } from '@nestjs/common';
import { GenericParams } from '@spider-cloud/spider-client';
import { Document } from 'langchain';
import { env } from 'src/shared/config/env';

export class SpiderService {
  async crawl(url: string, params: GenericParams): Promise<Document[]> {
    const loader = new SpiderLoader({
      apiKey: env.SPIDER_API_KEY,
      url,
      params,
    });

    return loader.load();
  }
}

export const SPIDER_SERVICE = 'SPIDER_SERVICE';

export const SpiderServiceProvider: Provider[] = [
  {
    provide: SPIDER_SERVICE,
    useFactory: () => {
      if (!env.SPIDER_API_KEY) {
        throw new Error('Spider API key must be provided');
      }
      return new SpiderService();
    },
  },
];
