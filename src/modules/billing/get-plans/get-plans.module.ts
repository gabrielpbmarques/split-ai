import { Module } from '@nestjs/common';

import { GetPlansController } from 'src/modules/billing/get-plans/get-plans.controller';
import { GetPlansService } from 'src/modules/billing/get-plans/get-plans.service';
import { PlanRepositoryModule } from 'src/modules/billing/repositories/plan.repository.module';

@Module({
  imports: [PlanRepositoryModule],
  providers: [GetPlansService],
  controllers: [GetPlansController],
  exports: [GetPlansService],
})
export class GetPlansModule {}
