import { DynamicStructuredTool } from 'langchain';
import { BravohubAnalyticsService } from 'src/infrastructure/providers/bravohub-analytics.provider';
import { z } from 'zod';

import { QueryResultCacheService } from './query-result-cache.service';

export type ExecuteSqlContext = {
  companyId: number;
  threadId: string;
};

type Deps = {
  analyticsService: BravohubAnalyticsService;
  cache: QueryResultCacheService;
};

const RESPONSE_ROW_PREVIEW = 50;

export function buildExecuteSqlTool(
  deps: Deps,
  ctx: ExecuteSqlContext,
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'execute_sql',
    description: [
      `Executa uma query SQL contra o bravohub_application via gateway. company_id desta empresa: ${ctx.companyId}.`,
      'Apenas SELECT. MySQL 5.7 (sem CTE, sem window functions).',
      'Toda query DEVE conter `WHERE company_id = ' +
        ctx.companyId +
        '` (ou IN (...)).',
      'Se a query falhar, leia o erro retornado e refaça. Limite de 3 tentativas por turno.',
      'Resultado vem como JSON com { rows, columns, rowCount, executionTimeMs }. Resultados acima de ' +
        RESPONSE_ROW_PREVIEW +
        ' linhas são truncados para amostra.',
      'Resultados são cacheados por turno de conversa — pode repetir a mesma query sem custo adicional.',
    ].join(' '),
    schema: z.object({
      query: z
        .string()
        .describe(
          'Query SQL MySQL 5.7-compatível, SELECT only, com filtro de company_id.',
        ),
      reasoning: z
        .string()
        .describe(
          'Frase curta explicando o que essa query responde da pergunta original. Vai para o trace de auditoria.',
        ),
    }),
    func: async ({ query }) => {
      const hash = deps.cache.hash(query, ctx.companyId);
      const cached = deps.cache.get(ctx.threadId, hash);
      if (cached) {
        return formatResult(cached, /* fromCache */ true);
      }
      const result = await deps.analyticsService.executeSql({
        query,
        companyId: ctx.companyId,
        source: 'split-ai-oracle',
      });
      if ('rows' in result) {
        deps.cache.set(ctx.threadId, hash, result);
      }
      return formatResult(result, false);
    },
  });
}

function formatResult(result: unknown, fromCache: boolean): string {
  if (result && typeof result === 'object' && 'error' in result) {
    return JSON.stringify({ ok: false, fromCache, ...(result as object) });
  }
  const success = result as {
    rows: unknown[];
    columns: { name: string }[];
    rowCount: number;
    executionTimeMs: number;
    warnings?: string[];
  };
  const truncated = success.rows.length > RESPONSE_ROW_PREVIEW;
  const sample = truncated
    ? success.rows.slice(0, RESPONSE_ROW_PREVIEW)
    : success.rows;
  return JSON.stringify({
    ok: true,
    fromCache,
    rowCount: success.rowCount,
    executionTimeMs: success.executionTimeMs,
    columns: success.columns,
    rows: sample,
    truncated,
    warnings: success.warnings ?? [],
  });
}
