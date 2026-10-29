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
        description: 'Run a web search',
        schema: z.object({
          query: z.string().describe('The search query'),
          maxResults: z.number().optional().default(5),
          topic: z
            .enum(['general', 'news', 'finance'])
            .optional()
            .default('general'),
          includeRawContent: z.boolean().optional().default(false),
        }),
      },
    );
  }
}
