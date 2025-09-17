import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { AgentInstructionEntity } from 'src/entities/agent-instruction.entity';

@Injectable()
export class AgentInstructionRepository {
  constructor(
    @InjectRepository(AgentInstructionEntity)
    private readonly repository: Repository<AgentInstructionEntity>,
  ) {}

  async create(
    data: Partial<AgentInstructionEntity>,
  ): Promise<AgentInstructionEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findByAgentId(agentId: string): Promise<AgentInstructionEntity | null> {
    return await this.repository.findOne({ where: { agent_id: agentId } });
  }

  async find(
    options: FindManyOptions<AgentInstructionEntity>,
  ): Promise<AgentInstructionEntity[]> {
    return await this.repository.find(options);
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
}
