import { Module } from '@nestjs/common';

import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { DashboardStatisticsController } from 'src/modules/reports/dashboard-statistics/dashboard-statistics.controller';
import { DashboardStatisticsService } from 'src/modules/reports/dashboard-statistics/dashboard-statistics.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';
import { MessageRepositoryModule } from 'src/modules/sessions/repositories/message.repository.module';
import { SessionRepositoryModule } from 'src/modules/sessions/repositories/session.repository.module';

@Module({
  imports: [
    AgentRepositoryModule,
    MessageRepositoryModule,
    ReportRepositoryModule,
    SessionRepositoryModule,
  ],
  controllers: [DashboardStatisticsController],
  providers: [DashboardStatisticsService],
  exports: [DashboardStatisticsService],
})
export class DashboardStatisticsModule {}
