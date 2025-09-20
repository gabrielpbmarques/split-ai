import { Injectable } from '@nestjs/common';
import { AgentEntity } from 'src/entities';
import { AgentRepository } from 'src/repositories';

@Injectable()
export class ListAgentsService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(): Promise<
    Pick<AgentEntity, 'id' | 'agent_identifier' | 'name'>[]
  > {
    return this.agentRepository.find({
      select: ['id', 'agent_identifier', 'name'],
    });
  }
}
