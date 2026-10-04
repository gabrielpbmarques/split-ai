import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportEntity } from 'src/infrastructure/database/schema';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  providers: [ReportRepository],
  exports: [ReportRepository],
})
export class ReportRepositoryModule {}
