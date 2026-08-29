import { Module } from '@nestjs/common';

import { GetDashboardDataModule } from './GetDashboardData/get-dashboard-data.module';

@Module({
  imports: [GetDashboardDataModule],
})
export class AnalyticsModule {}
