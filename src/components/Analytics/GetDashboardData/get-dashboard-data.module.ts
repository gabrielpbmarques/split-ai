import { Module } from '@nestjs/common';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';

import { GetDashboardDataController } from './get-dashboard-data.controller';
import { GetDashboardDataService } from './get-dashboard-data.service';

@Module({
  imports: [ReportRepositoryModule],
  providers: [GetDashboardDataService],
  exports: [GetDashboardDataService],
  controllers: [GetDashboardDataController],
})
export class GetDashboardDataModule {}
