import { Injectable, NotFoundException } from '@nestjs/common';

import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';

@Injectable()
export class DeleteAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(id: string): Promise<{ success: true }> {
    const connection = await this.agentConnectionRepository.findById(id);
    if (!connection) {
      throw new NotFoundException('Conexão não encontrada.');
    }

    await this.agentConnectionRepository.deleteById(connection.id);

    return { success: true };
  }
}
