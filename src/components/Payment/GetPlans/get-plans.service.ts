import { Injectable } from '@nestjs/common';
import { PlanEntity } from 'src/entities/plan.entity';
import { PlanRepository } from 'src/repositories/plan.repository';

@Injectable()
export class GetPlansService {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<PlanEntity[]> {
    return this.planRepository.findAll();
  }
}
