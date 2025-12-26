import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentEntity } from 'src/entities/agent.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class AgentRepository {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly repository: Repository<AgentEntity>,
  ) {}

  async create(data: Partial<AgentEntity>): Promise<AgentEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: string, data: Partial<AgentEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async findById(id: string): Promise<AgentEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<AgentEntity>,
  ): Promise<AgentEntity | null> {
    return await this.repository.findOne(options);
  }

  async findByIdentifier(identifier: string): Promise<AgentEntity | null> {
    return await this.repository.findOne({
      where: { agent_identifier: identifier },
    });
  }

  async find(options?: FindManyOptions<AgentEntity>): Promise<AgentEntity[]> {
    return await this.repository.find(options);
  }

  async count(options?: FindManyOptions<AgentEntity>): Promise<number> {
    return await this.repository.count(options);
  }

  async rawQuery(query: string): Promise<AgentEntity[]> {
    return await this.repository.query(query);
  }
}
