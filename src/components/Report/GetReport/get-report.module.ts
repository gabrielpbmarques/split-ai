import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetReportController } from './get-report.controller';
import { GetReportService } from './get-report.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetReportService],
  controllers: [GetReportController],
  exports: [GetReportService],
})
export class GetReportModule {}
