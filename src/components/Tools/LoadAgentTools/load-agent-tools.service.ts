import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { AppendConnectionToolsService } from 'src/components/ArtificialIntelligence/AppendConnectionTools/append-connection-tools.service';
import { AgentEntity } from 'src/entities';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { z } from 'zod';

import { LoadVectorSearchToolService } from '../LoadVectorSearchTool/load-vector-search-tool.service';
import { MaybeLoadDatabaseToolService } from '../MaybeLoadDatabaseTool/maybe-load-database-tool.service';

@Injectable()
export class LoadAgentToolsService {
  constructor(
    @Inject(forwardRef(() => AppendConnectionToolsService))
    private readonly appendConnectionToolsService: AppendConnectionToolsService,
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
    private readonly maybeLoadDatabaseToolService: MaybeLoadDatabaseToolService,
  ) {}

  async execute(
    dbAgent: AgentEntity,
    connectionContext?: { depth: number; visited: string[] },
    scopeCompanyId?: string,
  ): Promise<DynamicStructuredTool<z.ZodObject<any>>[]> {
    const tools: DynamicStructuredTool<z.ZodObject<any>>[] = [];

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
