import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { DashboardStatisticsController } from './dashboard-statistics.controller';
import { DashboardStatisticsService } from './dashboard-statistics.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [DashboardStatisticsController],
  providers: [DashboardStatisticsService],
  exports: [DashboardStatisticsService],
})
export class DashboardStatisticsModule {}
