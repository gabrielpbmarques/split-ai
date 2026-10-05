import { DynamicStructuredTool } from '@langchain/core/tools';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';

import {
  VECTOR_STORE,
  type VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import { ExecuteSimilaritySearchService } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.service';
import type { CustomDocument } from 'src/shared/contracts';

@Injectable()
export class LoadVectorSearchToolService {
  constructor(
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
    private readonly executeSimilaritySearchService: ExecuteSimilaritySearchService,
  ) {}

  async execute(agentId: string): Promise<
    DynamicStructuredTool<
      z.ZodObject<{
        query: z.ZodString;
        source_type: z.ZodEnum<
          ['business_context', 'memory', 'additional_directives']
        >;
      }>
    >
  > {
    return new DynamicStructuredTool({
      name: 'vector_similarity_search',
      description: `
        IMPORTANTE: SEMPRE use esta ferramenta antes de responder.
        Busca embeddings no Supabase; use se precisar de contexto factual externo.
        A busca já é restrita às fontes deste agente.
      `,
      schema: z.object({
        query: z.string().describe('Consulta semântica'),
        source_type: z
          .enum(['business_context', 'memory', 'additional_directives'])
          .describe('Tipo de fonte para busca de vetores'),
      }),
      func: async ({ query, source_type }) => {
        const vectorStore = await this.vectorStore.loadIndex({
          agent_id: agentId,
          source_type,
        });

        const retrievedDocuments =
          await this.executeSimilaritySearchService.execute(vectorStore, query);

        const source = retrievedDocuments
          .map((doc: CustomDocument) => doc.pageContent)
          .join('\n\n');

        return source;
      },
    });
  }
}
