import type { CrawledPage } from 'src/infrastructure/integration/site-crawler.port';
import type { SpiderDocument } from 'src/infrastructure/integration/spider/spider.contracts';

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
