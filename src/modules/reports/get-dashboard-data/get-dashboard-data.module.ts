import { Module } from '@nestjs/common';

import { GetDashboardDataController } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.controller';
import { GetDashboardDataService } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';

@Module({
  imports: [ReportRepositoryModule],
  providers: [GetDashboardDataService],
  exports: [GetDashboardDataService],
  controllers: [GetDashboardDataController],
})
export class GetDashboardDataModule {}
