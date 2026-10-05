import { Injectable } from '@nestjs/common';

import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import type { ListAgentsDto } from 'src/modules/agents/list-agents/list-agents.dto';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

interface AgentListItemView {
  id: string;
  agent_identifier: string | null;
  name: string;
  is_tool: boolean;
  is_principal: boolean;
}

const AGENT_LIST_FIELDS = ['id', 'agent_identifier', 'name'] as const;

@Injectable()
export class ListAgentsService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(
    dto: ListAgentsDto,
  ): Promise<PaginatedResponse<AgentListItemView>> {
    const page = await this.agentRepository.listPaginated(
      dto,
      AGENT_LIST_FIELDS,
    );
    const agents = page.items;

    const { principalIds, childIds } =
      await this.agentConnectionRepository.getAllRoleFlags();

    const items = agents.map((agent) => ({
      id: agent.id,
      agent_identifier: agent.agent_identifier,
      name: agent.name,
      is_tool: childIds.has(agent.id),
      is_principal: principalIds.has(agent.id),
    }));

    return toPaginatedResponse({ items, total: page.total }, dto);
  }
}
