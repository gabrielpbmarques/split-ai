import { Injectable, NotFoundException } from '@nestjs/common';

import {
  AgentConnectionRepository,
  type AgentConnectionView,
} from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

interface ListAgentConnectionsResult {
  principalAgentId: string;
  canvasLayout: Record<string, unknown> | null;
  connections: AgentConnectionView[];
}

@Injectable()
export class ListAgentConnectionsService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly agentRepository: AgentRepository,
  ) {}

  async execute(principalAgentId: string): Promise<ListAgentConnectionsResult> {
    const principal = await this.agentRepository.findById(principalAgentId);
    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }

    const connections =
      await this.agentConnectionRepository.listViewsByPrincipalAgentId(
        principalAgentId,
      );

    return {
      principalAgentId,
      canvasLayout: principal.canvas_layout ?? null,
      connections,
    };
  }
}
