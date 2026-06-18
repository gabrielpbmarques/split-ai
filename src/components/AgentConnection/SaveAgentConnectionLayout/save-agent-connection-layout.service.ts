import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentRepository } from 'src/repositories';

import { SaveAgentConnectionLayoutDto } from './save-agent-connection-layout.dto';

@Injectable()
export class SaveAgentConnectionLayoutService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    dto: SaveAgentConnectionLayoutDto,
    organizationId: string,
  ): Promise<{ success: true }> {
    const principal = await this.agentRepository.findById(dto.principalAgentId);
    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }
    if (principal.organization_id !== organizationId) {
      throw new ForbiddenException('Agente não pertence à sua organização.');
    }

    await this.agentRepository.update(dto.principalAgentId, {
      canvas_layout: dto.layout,
    });

    return { success: true };
  }
}
