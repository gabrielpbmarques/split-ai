import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentConnectionRepository } from 'src/repositories';

@Injectable()
export class DeleteAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(
    id: string,
    organizationId: string,
  ): Promise<{ success: true }> {
    const connection =
      await this.agentConnectionRepository.findByIdForOrganization(
        id,
        organizationId,
      );
    if (!connection) {
      throw new NotFoundException('Conexão não encontrada.');
    }

    await this.agentConnectionRepository.deleteById(id, organizationId);

    return { success: true };
  }
}
