import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SourceEntity } from 'src/entities/source.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SourceRepository {
  constructor(
    @InjectRepository(SourceEntity)
    private readonly repository: Repository<SourceEntity>,
  ) {}

  async create(data: Partial<SourceEntity>): Promise<SourceEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<SourceEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByAgentId(agentId: string): Promise<SourceEntity[]> {
    return await this.repository.find({
      where: { agent_id: agentId },
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: SourceEntity['status'],
    errorMessage?: string,
  ): Promise<void> {
    await this.repository.update(id, {
      status,
      error_message: errorMessage || null,
    });
  }

  async updateChunkCount(id: string, chunkCount: number): Promise<void> {
    await this.repository.update(id, { chunk_count: chunkCount });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
