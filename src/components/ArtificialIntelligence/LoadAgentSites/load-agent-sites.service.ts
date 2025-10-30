import { Injectable, Inject } from '@nestjs/common';
import { GenericParams } from '@spider-cloud/spider-client';
import {
  SPIDER_SERVICE,
  SpiderService,
} from 'src/infrastructure/providers/spider.provider';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';

@Injectable()
export class LoadAgentSitesService {
  constructor(
    @Inject(SPIDER_SERVICE)
    private readonly spiderService: SpiderService,
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(sites: string, agentId: string): Promise<void> {
    if (!sites?.length) return;

    const crawlParams: GenericParams = {
      limit: 20,
      depth: 25,
      metadata: true,
      readability: true,
      return_format: 'text',
    };

    const docs = await this.spiderService.crawl(sites, crawlParams);

    await this.supabaseService.createVectorStore(docs, {
      source_type: 'site',
      agent_id: agentId,
    });
  }
}
