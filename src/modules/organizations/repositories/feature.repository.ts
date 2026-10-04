import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FeatureEntity } from 'src/infrastructure/database/schema';

@Injectable()
export class FeatureRepository {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly repository: Repository<FeatureEntity>,
  ) {}

  async findById(id: string): Promise<FeatureEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByKey(key: string): Promise<FeatureEntity | null> {
    return this.repository.findOne({ where: { key } });
  }

  async findAll(): Promise<FeatureEntity[]> {
    return this.repository.find();
  }

  async create(data: Partial<FeatureEntity>): Promise<FeatureEntity> {
    const feature = this.repository.create(data);
    return this.repository.save(feature);
  }
}
