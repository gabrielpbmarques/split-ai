import { DynamicStructuredTool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { ExecuteSimilaritySearchService } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.service';
import { LoadVectorStoreService } from 'src/modules/retrieval/load-vector-store/load-vector-store.service';
import { CustomDocument } from 'src/shared/contracts';

@Injectable()
export class LoadVectorSearchToolService {
  constructor(
    private readonly loadVectorStoreService: LoadVectorStoreService,
    private readonly executeSimilaritySearchService: ExecuteSimilaritySearchService,
  ) {}

  async execute(): Promise<
    DynamicStructuredTool<
      z.ZodObject<{
        query: z.ZodString;
        agent_id: z.ZodString;
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
        O agent_id é {agentId}.
      `,
      schema: z.object({
        query: z.string().describe('Consulta semântica'),
        agent_id: z.string().describe('ID do agente'),
        source_type: z
          .enum(['business_context', 'memory', 'additional_directives'])
          .describe('Tipo de fonte para busca de vetores'),
      }),
      func: async ({ query, agent_id, source_type }) => {
        const vectorStore = await this.loadVectorStoreService.execute({
          agent_id,
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
