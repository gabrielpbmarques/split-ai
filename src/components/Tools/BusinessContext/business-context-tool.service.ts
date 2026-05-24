import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { ExecuteSimilaritySearchService } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadVectorStoreService } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service';
import { z } from 'zod';

export type BusinessContextToolContext = {
  organizationId: string;
};

@Injectable()
export class BusinessContextToolService {
  constructor(
    private readonly loadVectorStoreService: LoadVectorStoreService,
    private readonly executeSimilaritySearchService: ExecuteSimilaritySearchService,
  ) {}

  execute(
    ctx: BusinessContextToolContext,
  ): DynamicStructuredTool<z.ZodObject<{ term: z.ZodString }>> {
    return new DynamicStructuredTool({
      name: 'business_context',
      description: [
        'Consulta o glossário de domínio da organização indexado.',
        'Use quando encontrar um termo de negócio cujo significado não está claro só pelo schema.',
        'Retorna trechos curtos do glossário, ordenados por relevância semântica.',
      ].join(' '),
      schema: z.object({
        term: z
          .string()
          .describe('Termo ou pergunta sobre conceito de domínio.'),
      }),
      func: async ({ term }) => {
        try {
          const store = await this.loadVectorStoreService.execute({
            organization_id: ctx.organizationId,
          });
          const docs = await this.executeSimilaritySearchService.execute(
            store,
            term,
          );
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
}
