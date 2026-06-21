import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentConnectionRepository, AgentRepository } from 'src/repositories';
import { User } from 'src/types';

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
  ) {}

  async execute(
    principalAgentId: string,
    user: User,
  ): Promise<ListAgentConnectionsResult> {
    const principal = await this.agentRepository.findById(principalAgentId);
    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }
    const isPlatformAdmin = user.role === 'admin';
    if (
      !isPlatformAdmin &&
      principal.organization_id !== user.organization_id
    ) {
      throw new ForbiddenException('Agente não pertence à sua organização.');
    }

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
