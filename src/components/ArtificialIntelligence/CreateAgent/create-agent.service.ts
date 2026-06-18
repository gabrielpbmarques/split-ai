import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  AgentInstructionRepository,
  AgentRepository,
  OrganizationRepository,
} from 'src/repositories';
import { User } from 'src/types';

import { CreateAgentDto } from './create-agent.dto';

@Injectable()
export class CreateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(dto: CreateAgentDto, user: User) {
    await this.assertWithinAgentQuota(user.organization_id);

    const agent = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? 'claude-haiku-4-5-20251001',
      temperature: dto.temperature ?? 0.4,
      with_history: dto.withHistory ?? true,
      parser_schema: dto.parser?.schema ?? null,
      parser_name: dto.parser?.name ?? null,
      parser_description: dto.parser?.description ?? null,
      organization_id: user.organization_id,
      user_id: user.id,
    });

    await this.agentInstructionRepository.create({
      agent_id: agent.id,
      instructions: dto.instructions,
    });

    return { id: agent.id };
  }

  /**
   * Enforces the organization plan's `max_agents` quota. Plans flagged as
   * `unlimited` (e.g. the MAIA playground) and plans with a null `max_agents`
   * are unbounded.
   */
  private async assertWithinAgentQuota(organizationId: string): Promise<void> {
    const organization =
      await this.organizationRepository.findByIdWithPlan(organizationId);
    const plan = organization?.plan;

    if (!plan || plan.unlimited || plan.max_agents == null) {
      return;
    }

    const currentAgents = await this.agentRepository.count({
      where: { organization_id: organizationId },
    });

    if (currentAgents >= plan.max_agents) {
      throw new ForbiddenException(
        'Limite de agentes do seu plano atingido. Faça upgrade para criar mais agentes.',
      );
    }
  }
}
