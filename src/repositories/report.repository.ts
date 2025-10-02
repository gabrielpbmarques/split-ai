import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from 'src/entities/report.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly repository: Repository<ReportEntity>,
  ) {}

  async create(data: Partial<ReportEntity>): Promise<ReportEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: string, data: Partial<ReportEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async findById(id: string): Promise<ReportEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<ReportEntity>,
  ): Promise<ReportEntity | null> {
    return await this.repository.findOne(options);
  }

  async find(options?: FindManyOptions<ReportEntity>): Promise<ReportEntity[]> {
    return await this.repository.find(options);
  }
}
