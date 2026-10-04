import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanEntity } from 'src/infrastructure/database/schema';
import { PlanRepository } from 'src/modules/billing/repositories/plan.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity])],
  providers: [PlanRepository],
  exports: [PlanRepository],
})
export class PlanRepositoryModule {}
