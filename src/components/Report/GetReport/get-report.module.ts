import { Module } from '@nestjs/common';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';

import { GetReportController } from './get-report.controller';
import { GetReportService } from './get-report.service';

@Module({
  imports: [ReportRepositoryModule],
  providers: [GetReportService],
  controllers: [GetReportController],
  exports: [GetReportService],
})
export class GetReportModule {}
