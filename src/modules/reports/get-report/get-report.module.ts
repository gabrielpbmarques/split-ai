import { Module } from '@nestjs/common';

import { GetReportController } from 'src/modules/reports/get-report/get-report.controller';
import { GetReportService } from 'src/modules/reports/get-report/get-report.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';

@Module({
  imports: [ReportRepositoryModule],
  providers: [GetReportService],
  controllers: [GetReportController],
  exports: [GetReportService],
})
export class GetReportModule {}
