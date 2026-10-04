import { Injectable, Inject } from '@nestjs/common';
import { GenericParams } from '@spider-cloud/spider-client';

import { SpiderService } from 'src/infrastructure/spider/spider.provider';
import { SPIDER_SERVICE } from 'src/infrastructure/spider/spider.tokens';
import { SupabaseService } from 'src/infrastructure/supabase/supabase.provider';
import { SUPABASE_SERVICE } from 'src/infrastructure/supabase/supabase.tokens';

@Injectable()
export class LoadAgentSitesService {
  constructor(
    @Inject(SPIDER_SERVICE)
    private readonly spiderService: SpiderService,
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    sites: string,
    agentId: string,
    sourceId?: string,
  ): Promise<number> {
    if (!sites?.length) return 0;

    const crawlParams: GenericParams = {
      limit: 20,
      depth: 25,
      metadata: true,
      readability: true,
      return_format: 'text',
    };

    const docs = await this.spiderService.crawl(sites, crawlParams);

    const chunkCount = await this.supabaseService.createVectorStore(docs, {
      source_type: 'site',
      agent_id: agentId,
      source_id: sourceId,
    });

    return chunkCount;
  }
}
