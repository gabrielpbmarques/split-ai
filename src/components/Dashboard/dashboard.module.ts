import { Module } from '@nestjs/common';

import { DashboardChartsModule } from './Charts/dashboard-charts.module';
import { DashboardStatisticsModule } from './Statistics/dashboard-statistics.module';

@Module({
  imports: [DashboardStatisticsModule, DashboardChartsModule],
})
export class DashboardModule {}
