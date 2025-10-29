import { SpiderLoader } from '@langchain/community/document_loaders/web/spider';
import { Provider } from '@nestjs/common';
import { GenericParams } from '@spider-cloud/spider-client';
import { Document } from 'langchain';
import { config } from 'src/config';

export class SpiderService {
  async crawl(url: string, params: GenericParams): Promise<Document[]> {
    const loader = new SpiderLoader({
      apiKey: config.spiderApiKey,
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
      if (!config.spiderApiKey) {
        throw new Error('Spider API key must be provided');
      }
      return new SpiderService();
    },
  },
];
