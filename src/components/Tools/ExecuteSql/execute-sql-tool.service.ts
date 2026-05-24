import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { BravohubAnalyticsService } from 'src/infrastructure/providers/bravohub-analytics.provider';
import { OrganizationAnalyticsConfigRepository } from 'src/repositories';
import { z } from 'zod';

import { QueryResultCacheService } from './query-result-cache.service';

export type ExecuteSqlToolContext = {
  organizationId: string;
  threadId: string;
};

const RESPONSE_ROW_PREVIEW = 50;

@Injectable()
export class ExecuteSqlToolService {
  constructor(
    private readonly organizationAnalyticsConfigRepository: OrganizationAnalyticsConfigRepository,
    private readonly cache: QueryResultCacheService,
  ) {}

  execute(
    ctx: ExecuteSqlToolContext,
  ): DynamicStructuredTool<
    z.ZodObject<{ query: z.ZodString; reasoning: z.ZodString }>
  > {
    return new DynamicStructuredTool({
      name: 'execute_sql',
      description: [
        'Executa uma query SELECT contra o banco de dados analítico da organização via gateway HTTP.',
        'Toda query DEVE conter o filtro de tenant configurado para a organização (a coluna e valor exatos são determinados em tempo de execução).',
        'Apenas SELECT é permitido. Restrições adicionais de dialeto (ex.: ausência de CTE/window functions) dependem da configuração da organização.',
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
            'Query SQL SELECT-only, compatível com o dialeto da organização e contendo o filtro de tenant.',
          ),
        reasoning: z
          .string()
          .describe(
            'Frase curta explicando o que essa query responde da pergunta original. Vai para o trace de auditoria.',
          ),
      }),
      func: async ({ query }) => {
        const config =
          await this.organizationAnalyticsConfigRepository.findByOrganizationId(
            ctx.organizationId,
          );
        if (!config) {
          return JSON.stringify({
            ok: false,
            error: {
              code: 'NO_CONFIG',
              message:
                'Configuração analítica não encontrada para esta organização.',
            },
          });
        }
        if (!config.sql_gateway_api_key) {
          return JSON.stringify({
            ok: false,
            error: {
              code: 'NO_API_KEY',
              message:
                'Chave de acesso ao gateway analítico não configurada para esta organização.',
            },
          });
        }

        const tenantValue = config.tenant_filter_value;
        const tenantNumeric = Number(tenantValue);
        const companyIdForGateway = Number.isFinite(tenantNumeric)
          ? tenantNumeric
          : 0;

        const hash = this.cache.hash(query, tenantValue);
        const cached = this.cache.get(ctx.threadId, hash);
        if (cached) {
          return formatResult(cached, /* fromCache */ true);
        }

        const analyticsService = new BravohubAnalyticsService(
          config.sql_gateway_url,
          config.sql_gateway_api_key,
        );

        try {
          const result = await analyticsService.executeSql({
            query,
            companyId: companyIdForGateway,
          });
          if ('rows' in result) {
            this.cache.set(ctx.threadId, hash, result);
          }
          return formatResult(result, false);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'erro desconhecido';
          return JSON.stringify({
            ok: false,
            error: { code: 'TOOL_ERROR', message },
          });
        }
      },
    });
  }
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
