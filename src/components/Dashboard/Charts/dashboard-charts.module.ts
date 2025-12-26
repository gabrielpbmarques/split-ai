import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { DashboardChartsController } from './dashboard-charts.controller';
import { DashboardChartsService } from './dashboard-charts.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [DashboardChartsController],
  providers: [DashboardChartsService],
  exports: [DashboardChartsService],
})
export class DashboardChartsModule {}
