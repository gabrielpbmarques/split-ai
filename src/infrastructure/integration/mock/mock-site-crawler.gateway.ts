import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import type {
  CrawledPage,
  CrawlOptions,
  SiteCrawler,
} from 'src/infrastructure/integration/site-crawler.port';

export class MockSiteCrawlerGateway implements SiteCrawler {
  readonly name = 'spider';

  state(): IntegrationState {
    return 'MOCK';
  }

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
