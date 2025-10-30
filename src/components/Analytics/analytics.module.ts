import { Module } from '@nestjs/common';

import { GetDashboardDataModule } from './GetDashboardData/get-dashboard-data.module';

@Module({
  imports: [GetDashboardDataModule],
  exports: [GetDashboardDataModule],
})
export class AnalyticsModule {}
