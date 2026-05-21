import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DynamicStructuredTool } from 'langchain';
import {
  BRAVOHUB_ANALYTICS_SERVICE,
  BravohubAnalyticsService,
} from 'src/infrastructure/providers/bravohub-analytics.provider';
import { SUPABASE_CLIENT } from 'src/infrastructure/providers/supabase.provider';
import { z } from 'zod';

import { ExecuteSimilaritySearchService } from '../ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadVectorStoreService } from '../LoadVectorStore/load-vector-store.service';

import { buildBusinessContextTool } from './business-context.tool';
import { buildDescribeTableTool } from './describe-table.tool';
import { buildExecuteSqlTool } from './execute-sql.tool';
import { buildExploreSchemaTool } from './explore-schema.tool';
import { QueryResultCacheService } from './query-result-cache.service';
import { buildValidateSqlTool } from './validate-sql.tool';

export const ANALYTICS_ORACLE_IDENTIFIER = 'analytics-oracle';
export const NARRATE_EXECUTIVE_IDENTIFIER = 'narrate-executive';
export const RECOMMEND_PLAN_IDENTIFIER = 'recommend-plan';

const ANALYTICS_IDENTIFIERS = new Set<string>([
  ANALYTICS_ORACLE_IDENTIFIER,
  NARRATE_EXECUTIVE_IDENTIFIER,
  RECOMMEND_PLAN_IDENTIFIER,
]);

export type AnalyticsToolsContext = {
  companyId: number;
  threadId: string;
};

@Injectable()
export class LoadAnalyticsToolsService {
  constructor(
    private readonly loadVectorStore: LoadVectorStoreService,
    private readonly executeSimilaritySearch: ExecuteSimilaritySearchService,
    private readonly cache: QueryResultCacheService,
    @Inject(BRAVOHUB_ANALYTICS_SERVICE)
    private readonly analyticsService: BravohubAnalyticsService,
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  appliesTo(agentIdentifier: string | null | undefined): boolean {
    return !!agentIdentifier && ANALYTICS_IDENTIFIERS.has(agentIdentifier);
  }

  execute(
    agentIdentifier: string,
    ctx: AnalyticsToolsContext,
  ): DynamicStructuredTool<z.ZodObject<any>>[] {
    if (agentIdentifier === ANALYTICS_ORACLE_IDENTIFIER) {
      return [
        buildExploreSchemaTool({
          loadVectorStore: this.loadVectorStore,
          executeSimilaritySearch: this.executeSimilaritySearch,
        }),
        buildDescribeTableTool({
          supabaseClient: this.supabaseClient,
        }),
        buildValidateSqlTool({ companyId: ctx.companyId }),
        buildExecuteSqlTool(
          { analyticsService: this.analyticsService, cache: this.cache },
          { companyId: ctx.companyId, threadId: ctx.threadId },
        ),
        buildBusinessContextTool({
          loadVectorStore: this.loadVectorStore,
          executeSimilaritySearch: this.executeSimilaritySearch,
        }),
      ] as DynamicStructuredTool<z.ZodObject<any>>[];
    }
    return [];
  }
}
