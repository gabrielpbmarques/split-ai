import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PlanEntity,
  type PlanType,
} from 'src/infrastructure/database/schema/plan.entity';

@Injectable()
export class PlanRepository {
  constructor(
    @InjectRepository(PlanEntity)
    private planRepository: Repository<PlanEntity>,
  ) {}

  async findAll(): Promise<PlanEntity[]> {
    return this.planRepository.find({
      where: { active: true },
      order: { credits: 'ASC' },
    });
  }

  async findById(id: string): Promise<PlanEntity | null> {
    return this.planRepository.findOne({
      where: { id, active: true },
    });
  }

  async findByType(type: PlanType): Promise<PlanEntity | null> {
    return this.planRepository.findOne({
      where: { type, active: true },
    });
  }

  async findByStripePriceId(stripePriceId: string): Promise<PlanEntity | null> {
    return this.planRepository.findOne({
      where: { stripe_price_id: stripePriceId, active: true },
    });
  }

  async create(data: Partial<PlanEntity>): Promise<PlanEntity> {
    const plan = this.planRepository.create(data);
    return this.planRepository.save(plan);
  }

  async update(
    id: string,
    data: Partial<PlanEntity>,
  ): Promise<PlanEntity | null> {
    await this.planRepository.update(id, data);
    return this.findById(id);
  }
}
