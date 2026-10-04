import { Module } from '@nestjs/common';

import { DashboardChartsModule } from 'src/modules/reports/dashboard-charts/dashboard-charts.module';
import { DashboardStatisticsModule } from 'src/modules/reports/dashboard-statistics/dashboard-statistics.module';
import { GetDashboardDataModule } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.module';
import { GetReportModule } from 'src/modules/reports/get-report/get-report.module';
import { GetReportConversationModule } from 'src/modules/reports/get-report-conversation/get-report-conversation.module';
import { ListReportsModule } from 'src/modules/reports/list-reports/list-reports.module';

@Module({
  imports: [
    DashboardChartsModule,
    DashboardStatisticsModule,
    GetDashboardDataModule,
    GetReportConversationModule,
    GetReportModule,
    ListReportsModule,
  ],
  exports: [
    DashboardChartsModule,
    DashboardStatisticsModule,
    GetDashboardDataModule,
    GetReportConversationModule,
    GetReportModule,
    ListReportsModule,
  ],
})
export class ReportsModule {}
