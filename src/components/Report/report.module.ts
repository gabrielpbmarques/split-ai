import { Module } from '@nestjs/common';

import { GetReportModule } from './GetReport/get-report.module';
import { ListReportsModule } from './ListReports/list-reports.module';

@Module({
  imports: [ListReportsModule, GetReportModule],
  exports: [ListReportsModule, GetReportModule],
})
export class ReportModule {}
