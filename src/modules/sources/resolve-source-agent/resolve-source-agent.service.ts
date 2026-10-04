import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { isUuid } from 'src/shared/utils/is-uuid';

@Injectable()
export class ResolveSourceAgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    agentId: string | undefined,
  ): Promise<{ agentId: string; organizationId: string | null }> {
    let resolvedAgentId = agentId;
    let agent: AgentEntity | null = null;

    if (resolvedAgentId && !isUuid(resolvedAgentId)) {
      agent = await this.agentRepository.findByIdentifier(resolvedAgentId);
      if (!agent) {
        throw new Error('Agente não encontrado pelo identifier');
      }
      resolvedAgentId = agent.id;
    }

    if (!resolvedAgentId) {
      throw new Error('agentId é obrigatório');
    }

    if (!agent) {
      agent = await this.agentRepository.findById(resolvedAgentId);
    }

    return {
      agentId: resolvedAgentId,
      organizationId: agent?.organization_id ?? null,
    };
  }
}
