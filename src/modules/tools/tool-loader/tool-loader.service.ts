import { Injectable } from '@nestjs/common';

import { TavilySearchService } from 'src/modules/tools/tavily-search/tavily-search.service';
import { VectorSearchToolService } from 'src/modules/tools/vector-search-tool/vector-search-tool.service';
import type { AgentTool } from 'src/shared/contracts';

@Injectable()
export class ToolLoaderService {
  constructor(
    private readonly vectorSearchToolService: VectorSearchToolService,
    private readonly tavilySearchService: TavilySearchService,
  ) {}

  private readonly availableTools: Record<string, () => Promise<AgentTool[]>> =
    {
      sherlock: async () => [
        await this.vectorSearchToolService.execute('sherlock'),
      ],
      internet_research: async () => [await this.tavilySearchService.execute()],
    };

  async execute(agentIdentifier: string): Promise<AgentTool[]> {
    return this.availableTools[agentIdentifier]();
  }
}
