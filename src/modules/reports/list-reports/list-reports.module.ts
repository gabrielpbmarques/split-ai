import { Module } from '@nestjs/common';

import { ListReportsController } from 'src/modules/reports/list-reports/list-reports.controller';
import { ListReportsService } from 'src/modules/reports/list-reports/list-reports.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';

@Module({
  imports: [ReportRepositoryModule],
  providers: [ListReportsService],
  controllers: [ListReportsController],
  exports: [ListReportsService],
})
export class ListReportsModule {}
