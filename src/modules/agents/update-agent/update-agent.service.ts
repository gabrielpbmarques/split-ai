import { Injectable, NotFoundException } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import type { UpdateAgentDto } from 'src/modules/agents/update-agent/update-agent.dto';
import { isUuid } from 'src/shared/utils/is-uuid';

@Injectable()
export class UpdateAgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    idOrIdentifier: string,
    dto: UpdateAgentDto,
  ): Promise<{ id: string }> {
    const agent = await this.resolveAgent(idOrIdentifier);
    if (!agent) throw new NotFoundException('Agente não encontrado.');

    const updateData: Partial<AgentEntity> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.agentIdentifier !== undefined)
      updateData.agent_identifier = dto.agentIdentifier;
    if (dto.model !== undefined) updateData.model = dto.model;
    if (dto.temperature !== undefined) updateData.temperature = dto.temperature;
    if (dto.withHistory !== undefined)
      updateData.with_history = dto.withHistory;
    if (dto.sites !== undefined)
      updateData.sites = dto.sites && dto.sites.length ? dto.sites : null;
    if (dto.systemPrompt !== undefined)
      updateData.system_prompt = dto.systemPrompt;

    if (dto.responseFormat !== undefined) {
      updateData.response_format = dto.responseFormat;
    }

    if (Object.keys(updateData).length > 0) {
      await this.agentRepository.update(agent.id, updateData);
    }

    return { id: agent.id };
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
