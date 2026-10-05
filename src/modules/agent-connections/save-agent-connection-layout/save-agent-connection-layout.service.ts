import { Injectable, NotFoundException } from '@nestjs/common';

import type { SaveAgentConnectionLayoutDto } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.dto';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Injectable()
export class SaveAgentConnectionLayoutService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(dto: SaveAgentConnectionLayoutDto): Promise<{ success: true }> {
    const principal = await this.agentRepository.findById(dto.principalAgentId);
    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }

    await this.agentRepository.update(dto.principalAgentId, {
      canvas_layout: dto.layout,
    });

    return { success: true };
  }
}
