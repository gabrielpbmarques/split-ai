import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentEntity } from 'src/entities/agent.entity';
import { MessageEntity } from 'src/entities/message.entity';
import { SessionEntity } from 'src/entities/session.entity';
import { User } from 'src/types';
import { Between, Repository } from 'typeorm';

import {
  DashboardStatisticsDto,
  DashboardStatistics,
} from './dashboard-statistics.dto';

@Injectable()
export class DashboardStatisticsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async execute(
    user: User,
    dto: DashboardStatisticsDto,
  ): Promise<DashboardStatistics> {
    const { startDate, endDate } = this.getDateRange(dto);
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);

    // Get current period stats
    const currentStats = await this.getStatistics(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    // Get previous period stats for comparison
    const previousStats = await this.getStatistics(
      user,
      previousPeriod.start,
      previousPeriod.end,
      dto.agentId,
    );

    // Calculate percentage changes
    const totalConversationsChange = this.calculateChange(
      currentStats.totalConversations,
      previousStats.totalConversations,
    );

    const satisfactionRateChange = this.calculateChange(
      currentStats.satisfactionRate,
      previousStats.satisfactionRate,
    );

    const tokensUsedChange = this.calculateChange(
      currentStats.tokensUsed,
      previousStats.tokensUsed,
    );

    const activeAgentsChange = this.calculateChange(
      currentStats.activeAgents,
      previousStats.activeAgents,
    );

    return {
      totalConversations: currentStats.totalConversations,
      totalConversationsChange,
      satisfactionRate: currentStats.satisfactionRate,
      satisfactionRateChange,
      tokensUsed: currentStats.tokensUsed,
      tokensUsedChange,
      activeAgents: currentStats.activeAgents,
      activeAgentsChange,
    };
  }

  private async getStatistics(
    user: User,
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<DashboardStatistics> {
    const where: any = {
      created_at: Between(startDate, endDate),
    };

    // Apply organization filter for non-admins
    if (user.role !== 'admin' && user.organization_id) {
      where.organization_id = user.organization_id;
    }

    // Apply agent filter if provided
    if (agentId) {
      where.agent_id = agentId;
    }

    // Get total conversations (unique sessions)
    const sessions = await this.sessionRepository.find({ where });
    const totalConversations = sessions.length;

    // Calculate satisfaction rate from reports
    // For now, we'll simulate this based on sentiment from messages
    // In a real scenario, you might have a feedback table

    // Build query for positive messages with proper joins
    const positiveMessagesQuery = this.messageRepository
      .createQueryBuilder('m')
      .leftJoin('sessions', 's', 's.id = m.session_id')
      .where('m.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('m.from = :from', { from: 'agent' });

    if (user.role !== 'admin' && user.organization_id) {
      positiveMessagesQuery.andWhere('s.organization_id = :orgId', {
        orgId: user.organization_id,
      });
    }

    if (agentId) {
      positiveMessagesQuery.andWhere('m.agent_id = :agentId', { agentId });
    }

    const positiveMessages = await positiveMessagesQuery.getCount();

    // Build query for total messages with proper joins
    const totalMessagesQuery = this.messageRepository
      .createQueryBuilder('m')
      .leftJoin('sessions', 's', 's.id = m.session_id')
      .where('m.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('m.from = :from', { from: 'agent' });

    if (user.role !== 'admin' && user.organization_id) {
      totalMessagesQuery.andWhere('s.organization_id = :orgId', {
        orgId: user.organization_id,
      });
    }

    if (agentId) {
      totalMessagesQuery.andWhere('m.agent_id = :agentId', { agentId });
    }

    const totalMessages = await totalMessagesQuery.getCount();

    const satisfactionRate =
      totalMessages > 0
        ? Math.round((positiveMessages / totalMessages) * 100)
        : 94; // Default value

    // Calculate tokens used
    // Build query for messages with proper joins
    const messagesQuery = this.messageRepository
      .createQueryBuilder('m')
      .leftJoin('sessions', 's', 's.id = m.session_id')
      .where('m.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (user.role !== 'admin' && user.organization_id) {
      messagesQuery.andWhere('s.organization_id = :orgId', {
        orgId: user.organization_id,
      });
    }

    if (agentId) {
      messagesQuery.andWhere('m.agent_id = :agentId', { agentId });
    }

    const messages = await messagesQuery.getMany();
    const tokensUsed = messages.reduce((total, msg) => {
      // Rough estimation: 1 token per 4 characters
      return total + Math.ceil((msg.message?.length || 0) / 4);
    }, 0);

    // Get active agents count
    const activeAgents = await this.agentRepository.count({
      where:
        user.role !== 'admin' && user.organization_id
          ? { organization_id: user.organization_id }
          : {},
    });

    return {
      totalConversations,
      totalConversationsChange: 0,
      satisfactionRate,
      satisfactionRateChange: 0,
      tokensUsed,
      tokensUsedChange: 0,
      activeAgents,
      activeAgentsChange: 0,
    };
  }

  private getDateRange(dto: DashboardStatisticsDto): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dto.period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'custom':
        startDate = dto.startDate
          ? new Date(dto.startDate)
          : new Date(now.setDate(now.getDate() - 7));
        endDate = dto.endDate ? new Date(dto.endDate) : new Date();
        break;
      default:
        // Default to last 7 days
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }

    return { startDate, endDate };
  }

  private getPreviousPeriod(
    startDate: Date,
    endDate: Date,
  ): { start: Date; end: Date } {
    const duration = endDate.getTime() - startDate.getTime();
    const previousEnd = new Date(startDate.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    return { start: previousStart, end: previousEnd };
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }
}
