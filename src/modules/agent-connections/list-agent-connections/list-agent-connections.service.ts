import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

interface AgentConnectionView {
  id: string;
  childAgentId: string;
  childAgentName: string | null;
  childAgentIdentifier: string | null;
  toolName: string;
  toolDescription: string;
  enabled: boolean;
  position: number;
}

interface ListAgentConnectionsResult {
  principalAgentId: string;
  canvasLayout: any | null;
  connections: AgentConnectionView[];
}

@Injectable()
export class ListAgentConnectionsService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly agentRepository: AgentRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    principalAgentId: string,
    user: AuthenticatedUser,
  ): Promise<ListAgentConnectionsResult> {
    const principal = await this.agentRepository.findById(principalAgentId);
    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }
    this.accessScope.ensureCan(
      user,
      'agent-connection.manage',
      { organizationId: principal.organization_id },
      'Agente não pertence à sua organização.',
    );

    const connections =
      await this.agentConnectionRepository.findByPrincipalAgentId(
        principalAgentId,
      );

    return {
      principalAgentId,
      canvasLayout: principal.canvas_layout ?? null,
      connections: connections.map((connection) => ({
        id: connection.id,
        childAgentId: connection.child_agent_id,
        childAgentName: connection.childAgent?.name ?? null,
        childAgentIdentifier: connection.childAgent?.agent_identifier ?? null,
        toolName: connection.tool_name,
        toolDescription: connection.tool_description,
        enabled: connection.enabled,
        position: connection.position,
      })),
    };
  }
}
