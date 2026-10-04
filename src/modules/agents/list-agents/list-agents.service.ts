import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

/**
 * Item da lista de agentes. `is_tool` / `is_principal` são derivados das
 * conexões (existência de qualquer linha em `agent_connections`) e dirigem o
 * gating de "Conversar"/"Conectar" no console.
 */
interface AgentListItemView {
  id: string;
  agent_identifier: string | null;
  name: string;
  is_tool: boolean;
  is_principal: boolean;
}

@Injectable()
export class ListAgentsService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(user: AuthenticatedUser): Promise<AgentListItemView[]> {
    const isAdmin = user.role === 'admin';

    const agents = await this.agentRepository.find({
      select: ['id', 'agent_identifier', 'name'],
      where: isAdmin ? undefined : { organization_id: user.organization_id },
    });

    const { principalIds, childIds } =
      await this.agentConnectionRepository.getRoleFlagsByOrganization(
        isAdmin ? undefined : user.organization_id,
      );

    return agents.map((agent) => ({
      id: agent.id,
      agent_identifier: agent.agent_identifier,
      name: agent.name,
      is_tool: childIds.has(agent.id),
      is_principal: principalIds.has(agent.id),
    }));
  }
}
