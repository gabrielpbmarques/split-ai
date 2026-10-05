import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { LoadDatabaseToolService } from 'src/modules/retrieval/load-database-tool/load-database-tool.service';
import type { AgentTool } from 'src/shared/contracts';

@Injectable()
export class MaybeLoadDatabaseToolService {
  constructor(
    private readonly loadDatabaseToolService: LoadDatabaseToolService,
    private readonly agentRepository: AgentRepository,
  ) {}

  async execute(agent: AgentEntity): Promise<AgentTool | null> {
    if (!agent.database_tool) {
      return null;
    }

    const connection = await this.agentRepository.findDatabaseConnection(
      agent.id,
    );

    if (!connection?.database_url) {
      return null;
    }

    return this.loadDatabaseToolService.execute({
      databaseUrl: connection.database_url,
      includeTables: connection.database_tables?.length
        ? connection.database_tables
        : undefined,
      sampleRows: connection.database_sample_rows ?? undefined,
    });
  }
}
