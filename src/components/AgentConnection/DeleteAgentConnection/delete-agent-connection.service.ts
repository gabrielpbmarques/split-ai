import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentConnectionRepository } from 'src/repositories';
import { User } from 'src/types';

@Injectable()
export class DeleteAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(id: string, user: User): Promise<{ success: true }> {
    // Platform admins may delete any organization's connection; everyone else
    // is restricted to connections inside their own organization.
    const isPlatformAdmin = user.role === 'admin';
    const connection = isPlatformAdmin
      ? await this.agentConnectionRepository.findById(id)
      : await this.agentConnectionRepository.findByIdForOrganization(
          id,
          user.organization_id,
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
