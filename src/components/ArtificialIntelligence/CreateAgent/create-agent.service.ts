import { Injectable } from '@nestjs/common';
import { AgentInstructionRepository, AgentRepository } from 'src/repositories';
import { User } from 'src/types';

import { CreateAgentDto } from './create-agent.dto';

@Injectable()
export class CreateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
  ) {}

  async execute(dto: CreateAgentDto, user: User) {
    const agent = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? 'claude-haiku-4-5-20251001',
      temperature: dto.temperature ?? 0.4,
      with_history: dto.withHistory ?? true,
      parser_schema: dto.parser?.schema ?? null,
      parser_name: dto.parser?.name ?? null,
      parser_description: dto.parser?.description ?? null,
      organization_id: user.role === 'admin' ? null : user.organization_id,
      user_id: user.id,
      analytics_explore_schema: dto.analyticsExploreSchema ?? false,
      analytics_describe_table: dto.analyticsDescribeTable ?? false,
      analytics_validate_sql: dto.analyticsValidateSql ?? false,
      analytics_execute_sql: dto.analyticsExecuteSql ?? false,
      analytics_business_context: dto.analyticsBusinessContext ?? false,
    });

    await this.agentInstructionRepository.create({
      agent_id: agent.id,
      instructions: dto.instructions,
    });

    return { id: agent.id };
  }
}
