import { Injectable, Inject } from '@nestjs/common';

import {
  SITE_CRAWLER,
  SiteCrawler,
} from 'src/infrastructure/integration/site-crawler.port';
import {
  VECTOR_STORE,
  VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';

const CRAWL_LIMIT = 20;
const CRAWL_DEPTH = 25;

@Injectable()
export class LoadAgentSitesService {
  constructor(
    @Inject(SITE_CRAWLER) private readonly siteCrawler: SiteCrawler,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
  ) {}

  async execute(
    sites: string,
    agentId: string,
    sourceId?: string,
  ): Promise<number> {
    if (!sites?.length) return 0;

    const pages = await this.siteCrawler.crawl(sites, {
      limit: CRAWL_LIMIT,
      depth: CRAWL_DEPTH,
    });

    const chunks = pages.map((page) => ({
      pageContent: page.content,
      metadata: { ...page.metadata },
    }));

    return this.vectorStore.upsertChunks(chunks, {
      source_type: 'site',
      agent_id: agentId,
      source_id: sourceId,
    });
  }
}
