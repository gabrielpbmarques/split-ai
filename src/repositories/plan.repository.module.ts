import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from 'src/entities';

import { PlanRepository } from './plan.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity])],
  providers: [PlanRepository],
  exports: [PlanRepository],
})
export class PlanRepositoryModule {}
