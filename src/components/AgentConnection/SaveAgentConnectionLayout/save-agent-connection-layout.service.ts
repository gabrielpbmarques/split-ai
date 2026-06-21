import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentRepository } from 'src/repositories';
import { User } from 'src/types';

import { SaveAgentConnectionLayoutDto } from './save-agent-connection-layout.dto';

@Injectable()
export class SaveAgentConnectionLayoutService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    dto: SaveAgentConnectionLayoutDto,
    user: User,
  ): Promise<{ success: true }> {
    const principal = await this.agentRepository.findById(dto.principalAgentId);
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

    await this.agentRepository.update(dto.principalAgentId, {
      canvas_layout: dto.layout,
    });

    return { success: true };
  }
}
