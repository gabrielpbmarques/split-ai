import { Injectable } from '@nestjs/common';

import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { isUuid } from 'src/shared/utils/is-uuid';

@Injectable()
export class ResolveSourceAgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(agentId: string | undefined): Promise<{ agentId: string }> {
    let resolvedAgentId = agentId;

    if (resolvedAgentId && !isUuid(resolvedAgentId)) {
      const agent =
        await this.agentRepository.findByIdentifier(resolvedAgentId);
      if (!agent) {
        throw new Error('Agente não encontrado pelo identifier');
      }
      resolvedAgentId = agent.id;
    }

    if (!resolvedAgentId) {
      throw new Error('agentId é obrigatório');
    }

    return { agentId: resolvedAgentId };
  }
}
