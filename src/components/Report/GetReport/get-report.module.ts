import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';

import { GetReportController } from './get-report.controller';
import { GetReportService } from './get-report.service';

@Module({
  imports: [AuthModule, ReportRepositoryModule],
  providers: [GetReportService],
  controllers: [GetReportController],
  exports: [GetReportService],
})
export class GetReportModule {}
