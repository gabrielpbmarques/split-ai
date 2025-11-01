import { DynamicStructuredTool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { CustomDocument } from 'src/types';
import { z } from 'zod';

import { ExecuteSimilaritySearchService } from '../ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadVectorStoreService } from '../LoadVectorStore/load-vector-store.service';

@Injectable()
export class LoadVectorSearchToolService {
  constructor(
    private readonly loadVectorStoreService: LoadVectorStoreService,
    private readonly executeSimilaritySearchService: ExecuteSimilaritySearchService,
  ) {}

  async execute(): Promise<
    DynamicStructuredTool<
      z.ZodObject<{ query: z.ZodString; agent_id: z.ZodString }>
    >
  > {
    return new DynamicStructuredTool({
      name: 'vector_similarity_search',
      description:
        'Busca embeddings no Supabase; use se precisar de contexto factual externo. O agent_id é {agentId}.',
      schema: z.object({
        query: z.string().describe('Consulta semântica'),
        agent_id: z.string().describe('ID do agente'),
      }),
      func: async ({ query, agent_id }) => {
        const vectorStore = await this.loadVectorStoreService.execute({
          agent_id,
        });

        const retrievedDocuments =
          await this.executeSimilaritySearchService.execute(vectorStore, query);

        const source = retrievedDocuments
          .map((doc: CustomDocument) => doc.pageContent)
          .join(' ');

        return source;
      },
    });
  }
}
