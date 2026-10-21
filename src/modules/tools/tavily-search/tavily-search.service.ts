import {
  type TavilySearchAPIRetrieverFields,
  TavilySearch,
} from '@langchain/tavily';
import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

@Injectable()
export class TavilySearchService {
  constructor() {}

  async execute(): Promise<DynamicStructuredTool> {
    return new DynamicStructuredTool({
      name: 'tavily_search',
      description: 'Busca informações na internet',
      schema: z.object({
        query: z.string(),
        params: z.toZod<TavilySearchAPIRetrieverFields>(),
      }),
      func: async ({ query, params }) => {
        const searchTool = new TavilySearch(params);
        const result = await searchTool._call({ query });
        return result;
      },
    });
  }
}
