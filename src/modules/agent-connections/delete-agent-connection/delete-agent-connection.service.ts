import { Injectable, NotFoundException } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { requireOrganizationId } from 'src/auth/request-user';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';

@Injectable()
export class DeleteAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(
    id: string,
    user: AuthenticatedUser,
  ): Promise<{ success: true }> {
    const isPlatformAdmin = user.role === 'admin';
    const connection = isPlatformAdmin
      ? await this.agentConnectionRepository.findById(id)
      : await this.agentConnectionRepository.findByIdForOrganization(
          id,
          requireOrganizationId(user),
        );
    if (!connection) {
      throw new NotFoundException('Conexão não encontrada.');
    }

    await this.agentConnectionRepository.deleteById(
      connection.id,
      connection.organization_id,
    );

    return { success: true };
  }
}
