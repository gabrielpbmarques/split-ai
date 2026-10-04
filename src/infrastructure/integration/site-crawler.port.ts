import type { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const SITE_CRAWLER = Symbol('SITE_CRAWLER');

export interface CrawlOptions {
  readonly limit: number;
  readonly depth: number;
}

export interface CrawledPage {
  readonly content: string;
  readonly url?: string;
  readonly title?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface SiteCrawler extends IntegrationGateway {
  crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]>;
}
