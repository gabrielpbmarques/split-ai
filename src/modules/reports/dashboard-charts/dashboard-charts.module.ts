import { Module } from '@nestjs/common';

import { DashboardChartsController } from 'src/modules/reports/dashboard-charts/dashboard-charts.controller';
import { DashboardChartsService } from 'src/modules/reports/dashboard-charts/dashboard-charts.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';
import { MessageRepositoryModule } from 'src/modules/sessions/repositories/message.repository.module';
import { SessionRepositoryModule } from 'src/modules/sessions/repositories/session.repository.module';

@Module({
  imports: [
    MessageRepositoryModule,
    ReportRepositoryModule,
    SessionRepositoryModule,
  ],
  controllers: [DashboardChartsController],
  providers: [DashboardChartsService],
  exports: [DashboardChartsService],
})
export class DashboardChartsModule {}
