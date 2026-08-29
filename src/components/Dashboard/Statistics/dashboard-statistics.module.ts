import { Module } from '@nestjs/common';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';
import { MessageRepositoryModule } from 'src/repositories/message.repository.module';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';
import { SessionRepositoryModule } from 'src/repositories/session.repository.module';
import { TokenUsageRepositoryModule } from 'src/repositories/token-usage.repository.module';

import { DashboardStatisticsController } from './dashboard-statistics.controller';
import { DashboardStatisticsService } from './dashboard-statistics.service';

@Module({
  imports: [
    AgentRepositoryModule,
    MessageRepositoryModule,
    ReportRepositoryModule,
    SessionRepositoryModule,
    TokenUsageRepositoryModule,
  ],
  controllers: [DashboardStatisticsController],
  providers: [DashboardStatisticsService],
  exports: [DashboardStatisticsService],
})
export class DashboardStatisticsModule {}
