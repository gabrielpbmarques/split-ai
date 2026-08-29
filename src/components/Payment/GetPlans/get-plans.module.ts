import { Module } from '@nestjs/common';
import { PlanRepositoryModule } from 'src/repositories/plan.repository.module';

import { GetPlansController } from './get-plans.controller';
import { GetPlansService } from './get-plans.service';

@Module({
  imports: [PlanRepositoryModule],
  providers: [GetPlansService],
  controllers: [GetPlansController],
  exports: [GetPlansService],
})
export class GetPlansModule {}
