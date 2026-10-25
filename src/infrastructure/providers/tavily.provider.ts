import { DynamicStructuredTool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { type Provider, ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

import { env } from 'src/shared/config/env';
import type { AgentTool } from 'src/shared/contracts';

export const TAVILY_SEARCH_SERVICE = 'TAVILY_SEARCH_SERVICE';

export interface ITavilySearchService {
  createTool(): AgentTool;
}

export class LiveTavilySearchService implements ITavilySearchService {
  createTool(): AgentTool {
    if (!env.TAVILY_API_KEY) {
      throw new ServiceUnavailableException('Tavily não configurado');
    }

    return new TavilySearch({
      tavilyApiKey: env.TAVILY_API_KEY,
    });
  }
}

export class MockTavilySearchService implements ITavilySearchService {
  createTool(): AgentTool {
    return new DynamicStructuredTool({
      name: 'tavily_search',
      description: 'Busca simulada de informações na internet.',
      schema: z.object({
        query: z.string().describe('Consulta de busca web'),
      }),
      func: async ({ query }) =>
        JSON.stringify({
          query,
          results: [
            {
              title: `Resultado simulado para ${query}`,
              url: 'https://example.com',
              content: `Conteúdo simulado da busca web para: ${query}`,
            },
          ],
        }),
    });
  }
}

export const TavilyProvider: Provider[] = [
  {
    provide: TAVILY_SEARCH_SERVICE,
    useFactory: (): ITavilySearchService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockTavilySearchService();
      }
      return new LiveTavilySearchService();
    },
  },
];
