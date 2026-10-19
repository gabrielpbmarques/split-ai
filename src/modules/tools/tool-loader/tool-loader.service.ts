import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { VectorSearchToolService } from 'src/modules/tools/vector-search-tool/vector-search-tool.service';
import type { AgentTool } from 'src/shared/contracts';

@Injectable()
export class ToolLoaderService {
  constructor(
    private readonly vectorSearchToolService: VectorSearchToolService,
  ) {}

  private readonly availableTools: Record<
    string,
    (agentId: string) => Promise<AgentTool>
  > = {
    vector_search: (agentId: string) =>
      this.vectorSearchToolService.execute(agentId),
  };

  async execute(agent: AgentEntity): Promise<AgentTool[]> {
    const { tools } = agent;

    const result = await Promise.all(
      tools.map(async (tool) => {
        const toolFunction = this.availableTools[tool];
        return toolFunction(agent.id);
      }),
    );

    return result.filter(Boolean);
  }
}
