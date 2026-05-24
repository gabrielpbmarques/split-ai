import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DynamicStructuredTool } from 'langchain';
import { SUPABASE_CLIENT } from 'src/infrastructure/providers/supabase.provider';
import { z } from 'zod';

export type DescribeTableToolContext = {
  organizationId: string;
};

@Injectable()
export class DescribeTableToolService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  execute(
    ctx: DescribeTableToolContext,
  ): DynamicStructuredTool<z.ZodObject<{ table_name: z.ZodString }>> {
    return new DynamicStructuredTool({
      name: 'describe_table',
      description: [
        'Retorna o DDL exato (CREATE TABLE) de uma tabela específica do schema analítico indexado da organização.',
        'Use após `explore_schema` para confirmar nomes de colunas, tipos, índices e chaves antes de escrever a query.',
        'Aceita o nome exato da tabela em snake_case. Se incerto, use `explore_schema` primeiro.',
      ].join(' '),
      schema: z.object({
        table_name: z.string().describe('Nome exato da tabela em snake_case.'),
      }),
      func: async ({ table_name }) => {
        try {
          const query = this.supabaseClient
            .from('documents')
            .select('content, metadata')
            .eq('metadata->>source_type', 'mysql-schema')
            .eq('metadata->>table_name', table_name);

          // Scope by organization when the indexed docs carry organization_id;
          // legacy global rows without organization_id are returned as a fallback.
          const { data, error } = await query.limit(5);

          if (error) {
            return JSON.stringify({
              ok: false,
              message: `Falha ao consultar schema: ${error.message}`,
            });
          }
          if (!data || data.length === 0) {
            return JSON.stringify({
              ok: false,
              message: `Tabela "${table_name}" não encontrada no schema indexado. Use explore_schema para listar candidatos.`,
            });
          }

          const orgScoped = data.find(
            (row: any) => row?.metadata?.organization_id === ctx.organizationId,
          );
          const chosen = orgScoped ?? data[0];

          return JSON.stringify({
            ok: true,
            table_name,
            ddl: chosen.content,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'erro desconhecido';
          return JSON.stringify({ ok: false, message });
        }
      },
    });
  }
}
