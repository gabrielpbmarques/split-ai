import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { AIInstructions } from 'src/shared/contracts';
import { isUuid } from 'src/shared/utils/is-uuid';

export interface AgentDetails {
  id: string;
  name: string;
  agentIdentifier: string | null;
  model: string | null;
  temperature: number | null;
  withHistory: boolean;
  organization_id: string | null;
  sites: string[] | null;
  parser: { name: string; description: string; schema: unknown } | null;
  instructions: AIInstructions | null;
  isTool: boolean;
  isPrincipal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    idOrIdentifier: string,
    user: AuthenticatedUser,
  ): Promise<AgentDetails> {
    const agent = await this.resolveAgent(idOrIdentifier);

    if (!agent) {
      throw new NotFoundException('Agente não encontrado.');
    }

    this.accessScope.ensureCan(
      user,
      'agent.read',
      { organizationId: agent.organization_id },
      'Você não tem acesso a este agente.',
    );

    const [latest, flags] = await Promise.all([
      this.agentInstructionRepository.findLatestByAgentId(agent.id),
      this.agentConnectionRepository.getRoleFlags(agent.id),
    ]);

    return {
      id: agent.id,
      name: agent.name,
      agentIdentifier: agent.agent_identifier,
      model: agent.model,
      temperature: agent.temperature,
      withHistory: agent.with_history,
      organization_id: agent.organization_id ?? null,
      sites: (agent as any).sites ?? null,
      parser: agent.parser_schema
        ? {
            name: agent.parser_name,
            description: agent.parser_description,
            schema: agent.parser_schema,
          }
        : null,
      instructions: latest?.instructions || null,
      isTool: flags.isTool,
      isPrincipal: flags.isPrincipal,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
    };
  }

  private async resolveAgent(
    idOrIdentifier: string,
  ): Promise<AgentEntity | null> {
    if (isUuid(idOrIdentifier)) {
      const byId = await this.agentRepository.findById(idOrIdentifier);
      if (byId) return byId;
    }
    return this.agentRepository.findByIdentifier(idOrIdentifier);
  }
}
