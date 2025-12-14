import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { ReportEntity } from 'src/entities/report.entity';
import { SessionEntity } from 'src/entities/session.entity';

import { DashboardChartsController } from './dashboard-charts.controller';
import { DashboardChartsService } from './dashboard-charts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, MessageEntity, ReportEntity]),
  ],
  controllers: [DashboardChartsController],
  providers: [DashboardChartsService],
  exports: [DashboardChartsService],
})
export class DashboardChartsModule {}
