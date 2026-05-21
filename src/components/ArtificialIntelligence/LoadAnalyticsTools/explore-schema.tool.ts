import { DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

import { ExecuteSimilaritySearchService } from '../ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadVectorStoreService } from '../LoadVectorStore/load-vector-store.service';

type Deps = {
  loadVectorStore: LoadVectorStoreService;
  executeSimilaritySearch: ExecuteSimilaritySearchService;
};

export function buildExploreSchemaTool(deps: Deps): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'explore_schema',
    description: [
      'Faz busca semântica no schema MySQL do bravohub_application.',
      'Use SEMPRE no início de uma análise para descobrir quais tabelas e colunas são relevantes para a pergunta.',
      'Retorna blocos de DDL (CREATE TABLE) e sinopses curtas. Use os nomes encontrados para refinar com `describe_table`.',
      'NUNCA invente nomes de tabela — confirme via esta ferramenta primeiro.',
    ].join(' '),
    schema: z.object({
      question: z
        .string()
        .describe('Pergunta ou tópico em linguagem natural (pt-BR ou en).'),
    }),
    func: async ({ question }) => {
      try {
        const store = await deps.loadVectorStore.execute({
          source_type: 'mysql-schema',
        });
        const docs = await deps.executeSimilaritySearch.execute(
          store,
          question,
        );
        if (!docs.length) {
          return JSON.stringify({
            ok: false,
            message:
              'Nenhuma tabela encontrada para essa busca. Reformule a pergunta com termos do domínio (ex.: voucher, redeem, sale_user).',
          });
        }
        return JSON.stringify({
          ok: true,
          matches: docs.map((d) => ({
            table_name: d.metadata?.table_name,
            ddl: d.pageContent,
          })),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'erro desconhecido';
        return JSON.stringify({
          ok: false,
          message: `Falha ao explorar schema: ${message}`,
        });
      }
    },
  });
}
