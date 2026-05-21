import { DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

import { ExecuteSimilaritySearchService } from '../ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadVectorStoreService } from '../LoadVectorStore/load-vector-store.service';

type Deps = {
  loadVectorStore: LoadVectorStoreService;
  executeSimilaritySearch: ExecuteSimilaritySearchService;
};

export function buildBusinessContextTool(deps: Deps): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'business_context',
    description: [
      'Consulta o glossário de domínio da BravoHub indexado: mecânicas de campanha (Rex, Sale, Gift, Discount, Affiliates),',
      'gamification, hierarquias de participantes, eventos analytics, scripts de fechamento.',
      'Use quando encontrar um termo de negócio cujo significado não está claro só pelo schema',
      '(ex.: "o que é chargeback no Rex?", "como funciona node vs team?", "o que é booster no Vsale?").',
    ].join(' '),
    schema: z.object({
      term: z
        .string()
        .describe('Termo ou pergunta sobre conceito de domínio BravoHub.'),
    }),
    func: async ({ term }) => {
      try {
        const store = await deps.loadVectorStore.execute({
          source_type: 'bravohub-domain',
        });
        const docs = await deps.executeSimilaritySearch.execute(store, term);
        if (!docs.length) {
          return JSON.stringify({
            ok: false,
            message: 'Termo não encontrado no glossário indexado.',
          });
        }
        return JSON.stringify({
          ok: true,
          excerpts: docs.slice(0, 5).map((d) => ({
            source: d.metadata?.source_name,
            text: d.pageContent,
          })),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'erro desconhecido';
        return JSON.stringify({ ok: false, message });
      }
    },
  });
}
