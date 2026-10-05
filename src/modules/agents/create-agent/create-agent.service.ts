import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { TransactionExecutor } from 'src/infrastructure/database/transaction-executor/transaction-executor.service';
import type { CreateAgentDto } from 'src/modules/agents/create-agent/create-agent.dto';
import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Injectable()
export class CreateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly transactionExecutor: TransactionExecutor,
  ) {}

  async execute(
    dto: CreateAgentDto,
    user: AuthenticatedUser,
  ): Promise<{ id: string }> {
    const agent = await this.transactionExecutor.run(async (tx) => {
      const created = await this.agentRepository.create(
        {
          name: dto.name,
          agent_identifier: dto.agentIdentifier ?? null,
          model: dto.model ?? 'claude-haiku-4-5-20251001',
          temperature: dto.temperature ?? 0.4,
          with_history: dto.withHistory ?? true,
          database_tool: dto.databaseTool ?? true,
          vector_search_tool: dto.vectorSearchTool ?? true,
          database_url: dto.databaseUrl ?? null,
          database_tables: dto.databaseTables ?? null,
          database_sample_rows: dto.databaseSampleRows ?? null,
          parser_schema: dto.parser?.schema ?? null,
          parser_name: dto.parser?.name ?? null,
          parser_description: dto.parser?.description ?? null,
          user_id: user.id,
        },
        tx,
      );

      await this.agentInstructionRepository.create(
        { agent_id: created.id, instructions: dto.instructions },
        tx,
      );

      return created;
    });

    return { id: agent.id };
  }
}
