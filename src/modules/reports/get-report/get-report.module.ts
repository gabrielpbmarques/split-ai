import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { GetReportController } from 'src/modules/reports/get-report/get-report.controller';
import { GetReportService } from 'src/modules/reports/get-report/get-report.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';

@Module({
  imports: [AuthModule, ReportRepositoryModule],
  providers: [GetReportService],
  controllers: [GetReportController],
  exports: [GetReportService],
})
export class GetReportModule {}
