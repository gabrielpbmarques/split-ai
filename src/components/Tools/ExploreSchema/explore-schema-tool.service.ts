import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { ExecuteSimilaritySearchService } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadVectorStoreService } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service';
import { z } from 'zod';

export type ExploreSchemaToolContext = {
  organizationId: string;
};

@Injectable()
export class ExploreSchemaToolService {
  constructor(
    private readonly loadVectorStoreService: LoadVectorStoreService,
    private readonly executeSimilaritySearchService: ExecuteSimilaritySearchService,
  ) {}

  execute(
    ctx: ExploreSchemaToolContext,
  ): DynamicStructuredTool<z.ZodObject<{ question: z.ZodString }>> {
    return new DynamicStructuredTool({
      name: 'explore_schema',
      description: [
        'Faz busca semântica no schema do banco de dados analítico indexado da organização.',
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
          const store = await this.loadVectorStoreService.execute({
            source_type: 'mysql-schema',
            organization_id: ctx.organizationId,
          });
          const docs = await this.executeSimilaritySearchService.execute(
            store,
            question,
          );
          if (!docs.length) {
            return JSON.stringify({
              ok: false,
              message:
                'Nenhuma tabela encontrada para essa busca. Reformule a pergunta com termos do domínio.',
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
}
