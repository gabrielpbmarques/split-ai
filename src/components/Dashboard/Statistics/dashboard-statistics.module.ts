import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from 'src/entities/agent.entity';
import { MessageEntity } from 'src/entities/message.entity';
import { SessionEntity } from 'src/entities/session.entity';

import { DashboardStatisticsController } from './dashboard-statistics.controller';
import { DashboardStatisticsService } from './dashboard-statistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, MessageEntity, AgentEntity]),
  ],
  controllers: [DashboardStatisticsController],
  providers: [DashboardStatisticsService],
  exports: [DashboardStatisticsService],
})
export class DashboardStatisticsModule {}
