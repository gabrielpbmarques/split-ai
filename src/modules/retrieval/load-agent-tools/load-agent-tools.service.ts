import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AppendConnectionToolsService } from 'src/modules/agent-runtime/append-connection-tools/append-connection-tools.service';
import { LoadVectorSearchToolService } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service';
import { MaybeLoadDatabaseToolService } from 'src/modules/retrieval/maybe-load-database-tool/maybe-load-database-tool.service';
import type { AgentTool } from 'src/shared/contracts';
import { buildLangchainToolFromSchema } from 'src/shared/utils/build-zod-schema';

@Injectable()
export class LoadAgentToolsService {
  constructor(
    private readonly appendConnectionToolsService: AppendConnectionToolsService,
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
    private readonly maybeLoadDatabaseToolService: MaybeLoadDatabaseToolService,
  ) {}

  async execute(
    dbAgent: AgentEntity,
    connectionContext?: { depth: number; visited: string[] },
    scopeCompanyId?: string,
  ): Promise<AgentTool[]> {
    const tools: AgentTool[] = [];

    if (dbAgent.parser_schema) {
      tools.push(
        buildLangchainToolFromSchema(
          dbAgent.parser_name || 'dynamic_parser',
          dbAgent.parser_description || 'Ferramenta de parsing dinâmica',
          dbAgent.parser_schema,
        ),
      );
    }

    if (dbAgent.vector_search_tool) {
      tools.push(await this.loadVectorSearchToolService.execute());
    }

    if (dbAgent.database_tool && dbAgent.organization_id) {
      const databaseTool = await this.maybeLoadDatabaseToolService.execute(
        dbAgent.organization_id,
        scopeCompanyId,
        dbAgent,
      );
      if (databaseTool) {
        tools.push(databaseTool);
      }
    }

    await this.appendConnectionToolsService.execute(
      dbAgent,
      tools,
      connectionContext,
      scopeCompanyId,
    );

    return tools;
  }
}
