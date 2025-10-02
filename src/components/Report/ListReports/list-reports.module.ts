import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListReportsController } from './list-reports.controller';
import { ListReportsService } from './list-reports.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ListReportsService],
  controllers: [ListReportsController],
  exports: [ListReportsService],
})
export class ListReportsModule {}
