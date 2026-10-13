import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { LoadVectorSearchToolService } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service';
import type { AgentTool } from 'src/shared/contracts';
import { buildLangchainToolFromSchema } from 'src/shared/utils/build-zod-schema';
@Injectable()
export class LoadAgentToolsService {
  constructor(
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
  ) {}

  async execute(dbAgent: AgentEntity): Promise<AgentTool[]> {
    const tools: AgentTool[] = [];

    if (dbAgent.response_format) {
      tools.push(buildLangchainToolFromSchema(dbAgent.response_format));
    }

    for (const toolId of dbAgent.tools ?? []) {
      if (toolId === 'vector_search') {
        tools.push(await this.loadVectorSearchToolService.execute(dbAgent.id));
      }
    }

    return tools;
  }
}
