import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Injectable()
export class ResolveSourceAgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(agentId: string | undefined): Promise<{ agentId: string }> {
    if (!agentId) {
      throw new BadRequestException('agentId é obrigatório');
    }

    const agent = await this.agentRepository.findByIdOrIdentifier(agentId);

    if (!agent) {
      throw new NotFoundException('Agente não encontrado');
    }

    return { agentId: agent.id };
  }
}
