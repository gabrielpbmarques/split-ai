import { Injectable } from '@nestjs/common';
import { AgentEntity } from 'src/entities';
import { AgentRepository } from 'src/repositories';
import { User } from 'src/types';

@Injectable()
export class ListAgentsService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    user: User,
  ): Promise<Pick<AgentEntity, 'id' | 'agent_identifier' | 'name'>[]> {
    if (user.role === 'admin') {
      return this.agentRepository.find({
        select: ['id', 'agent_identifier', 'name'],
      });
    }

    return this.agentRepository.find({
      select: ['id', 'agent_identifier', 'name'],
      where: {
        organization_id: user.organization_id,
      },
    });
  }
}
