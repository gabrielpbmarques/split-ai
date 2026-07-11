import { Injectable } from '@nestjs/common';
import { AgentEntity } from 'src/entities/agent.entity';
import { AgentRepository } from 'src/repositories';
import { isUuid } from 'src/utils/isUuid';

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
