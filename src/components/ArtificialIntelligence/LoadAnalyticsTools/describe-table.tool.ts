import { SupabaseClient } from '@supabase/supabase-js';
import { DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

type Deps = {
  supabaseClient: SupabaseClient;
};

export function buildDescribeTableTool(deps: Deps): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'describe_table',
    description: [
      'Retorna o DDL exato (CREATE TABLE) de uma tabela específica do bravohub_application.',
      'Use após `explore_schema` para confirmar nomes de colunas, tipos, índices e chaves antes de escrever a query.',
      'Aceita nome exato da tabela (snake_case). Se incerto, use `explore_schema` primeiro.',
    ].join(' '),
    schema: z.object({
      table_name: z
        .string()
        .describe(
          'Nome exato da tabela em snake_case (ex.: app_company_campaign_rex_order).',
        ),
    }),
    func: async ({ table_name }) => {
      try {
        const { data, error } = await deps.supabaseClient
          .from('documents')
          .select('content, metadata')
          .eq('metadata->>source_type', 'mysql-schema')
          .eq('metadata->>table_name', table_name)
          .limit(1);

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
        return JSON.stringify({
          ok: true,
          table_name,
          ddl: data[0].content,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'erro desconhecido';
        return JSON.stringify({ ok: false, message });
      }
    },
  });
}
