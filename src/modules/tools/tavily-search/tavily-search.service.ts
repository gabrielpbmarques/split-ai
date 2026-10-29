import { tool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { env } from 'src/shared/config/env';
import type { AgentTool } from 'src/shared/contracts';

@Injectable()
export class TavilySearchService {
  constructor() {}

  async execute(): Promise<AgentTool> {
    return tool(
      async ({
        query,
        maxResults = 5,
        topic = 'general',
        includeRawContent = false,
      }: {
        query: string;
        maxResults?: number;
        topic?: 'general' | 'news' | 'finance';
        includeRawContent?: boolean;
      }) => {
        const tavilySearch = new TavilySearch({
          maxResults,
          tavilyApiKey: env.TAVILY_API_KEY,
          includeRawContent,
          topic,
        });
        return await tavilySearch._call({ query });
      },
      {
        name: 'internet_search',
        description:
          'Executa uma pesquisa na web para buscar informações atualizadas e relevantes em tempo real.',
        schema: z.object({
          query: z
            .string()
            .describe('Termo ou pergunta a ser pesquisada na web'),
          maxResults: z
            .number()
            .optional()
            .default(5)
            .describe('Número máximo de resultados a retornar'),
          topic: z
            .enum(['general', 'news', 'finance'])
            .optional()
            .default('general')
            .describe(
              'Categoria do tópico da busca: general (geral), news (notícias) ou finance (finanças)',
            ),
          includeRawContent: z
            .boolean()
            .optional()
            .default(false)
            .describe('Se deve incluir o conteúdo bruto da página'),
        }),
      },
    );
  }
}
