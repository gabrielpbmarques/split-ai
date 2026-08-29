import { Module } from '@nestjs/common';
import { MessageRepositoryModule } from 'src/repositories/message.repository.module';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';
import { SessionRepositoryModule } from 'src/repositories/session.repository.module';
import { TokenUsageRepositoryModule } from 'src/repositories/token-usage.repository.module';

import { DashboardChartsController } from './dashboard-charts.controller';
import { DashboardChartsService } from './dashboard-charts.service';

@Module({
  imports: [
    MessageRepositoryModule,
    ReportRepositoryModule,
    SessionRepositoryModule,
    TokenUsageRepositoryModule,
  ],
  controllers: [DashboardChartsController],
  providers: [DashboardChartsService],
  exports: [DashboardChartsService],
})
export class DashboardChartsModule {}
