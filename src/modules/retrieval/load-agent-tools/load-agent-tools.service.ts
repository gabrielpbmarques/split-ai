import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AppendConnectionToolsService } from 'src/modules/agent-runtime/append-connection-tools/append-connection-tools.service';
import { LoadVectorSearchToolService } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service';
import type { AgentTool } from 'src/shared/contracts';
import { buildLangchainToolFromSchema } from 'src/shared/utils/build-zod-schema';
@Injectable()
export class LoadAgentToolsService {
  constructor(
    private readonly appendConnectionToolsService: AppendConnectionToolsService,
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
  ) {}

  async execute(
    dbAgent: AgentEntity,
    connectionContext?: { depth: number; visited: string[] },
  ): Promise<AgentTool[]> {
    const tools: AgentTool[] = [];

    if (dbAgent.response_format) {
      tools.push(buildLangchainToolFromSchema(dbAgent.response_format));
    }

    if (dbAgent.vector_search_tool) {
      tools.push(await this.loadVectorSearchToolService.execute(dbAgent.id));
    }

    await this.appendConnectionToolsService.execute(
      dbAgent,
      tools,
      connectionContext,
    );

    return tools;
  }
}
