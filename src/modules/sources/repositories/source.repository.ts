import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SourceEntity } from 'src/infrastructure/database/schema/source.entity';
import {
  PageRequest,
  PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

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

  async listByAgentPaginated(
    agentId: string,
    page: PageRequest,
  ): Promise<PageResult<SourceEntity>> {
    const [items, total] = await this.repository.findAndCount({
      where: { agent_id: agentId },
      order: { created_at: 'DESC' },
      skip: skipOf(page),
      take: page.limit,
    });

    return { items, total };
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
