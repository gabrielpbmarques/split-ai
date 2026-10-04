import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Executor } from 'src/infrastructure/database/database.types';
import { AgentInstructionEntity } from 'src/infrastructure/database/schema/agent-instruction.entity';
import type { AIInstructions } from 'src/shared/contracts';

@Injectable()
export class AgentInstructionRepository {
  constructor(
    @InjectRepository(AgentInstructionEntity)
    private readonly repository: Repository<AgentInstructionEntity>,
  ) {}

  async create(
    data: Partial<AgentInstructionEntity>,
    tx?: Executor,
  ): Promise<AgentInstructionEntity> {
    const repo = this.repo(tx);
    return repo.save(repo.create(data));
  }

  async findByAgentId(agentId: string): Promise<AgentInstructionEntity | null> {
    return await this.repository.findOne({ where: { agent_id: agentId } });
  }

  async findLatestByAgentId(
    agentId: string,
  ): Promise<AgentInstructionEntity | null> {
    const list = await this.repository.find({
      where: { agent_id: agentId },
      order: { created_at: 'DESC' },
      take: 1,
    });
    return list[0] || null;
  }

  async updateLatestByAgentId(
    agentId: string,
    instructions: AIInstructions,
    tx?: Executor,
  ): Promise<AgentInstructionEntity> {
    const latest = await this.findLatestByAgentId(agentId);
    if (latest) {
      latest.instructions = instructions;
      return this.repo(tx).save(latest);
    }
    return this.create({ agent_id: agentId, instructions }, tx);
  }

  private repo(tx?: Executor): Repository<AgentInstructionEntity> {
    return tx ? tx.getRepository(AgentInstructionEntity) : this.repository;
  }
}
