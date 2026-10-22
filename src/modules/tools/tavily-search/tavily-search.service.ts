import { TavilySearch } from '@langchain/tavily';
import { Injectable } from '@nestjs/common';

import { env } from 'src/shared/config/env';
import type { AgentTool } from 'src/shared/contracts';

@Injectable()
export class TavilySearchService {
  async execute(): Promise<AgentTool> {
    return new TavilySearch({
      tavilyApiKey: env.TAVILY_API_KEY,
    });
  }
}
