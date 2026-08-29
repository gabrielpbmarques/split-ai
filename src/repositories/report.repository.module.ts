import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from 'src/entities';

import { ReportRepository } from './report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  providers: [ReportRepository],
  exports: [ReportRepository],
})
export class ReportRepositoryModule {}
