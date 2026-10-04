import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { SaveAgentConnectionLayoutDto } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.dto';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Injectable()
export class SaveAgentConnectionLayoutService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    dto: SaveAgentConnectionLayoutDto,
    user: AuthenticatedUser,
  ): Promise<{ success: true }> {
    const principal = await this.agentRepository.findById(dto.principalAgentId);
    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }
    this.accessScope.ensureCan(
      user,
      'agent-connection.manage',
      { organizationId: principal.organization_id },
      'Agente não pertence à sua organização.',
    );

    await this.agentRepository.update(dto.principalAgentId, {
      canvas_layout: dto.layout,
    });

    return { success: true };
  }
}
