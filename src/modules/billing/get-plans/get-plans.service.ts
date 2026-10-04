import { Injectable } from '@nestjs/common';

import type { PlanEntity } from 'src/infrastructure/database/schema/plan.entity';
import { PlanRepository } from 'src/modules/billing/repositories/plan.repository';

@Injectable()
export class GetPlansService {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<PlanEntity[]> {
    return this.planRepository.findAll();
  }
}
