import { Module } from '@nestjs/common';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';

import { ListReportsController } from './list-reports.controller';
import { ListReportsService } from './list-reports.service';

@Module({
  imports: [ReportRepositoryModule],
  providers: [ListReportsService],
  controllers: [ListReportsController],
  exports: [ListReportsService],
})
export class ListReportsModule {}
