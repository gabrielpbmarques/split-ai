import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import {
  type TokenUsageFilters,
  TokenUsageRepository,
} from 'src/modules/billing/repositories/token-usage.repository';
import type {
  DashboardStatisticsDto,
  DashboardStatistics,
} from 'src/modules/reports/dashboard-statistics/dashboard-statistics.dto';
import {
  type ReportFilters,
  ReportRepository,
} from 'src/modules/reports/repositories/report.repository';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';
import { SessionRepository } from 'src/modules/sessions/repositories/session.repository';
import { scopedOrganizationId } from 'src/shared/utils/scoped-organization-id';

@Injectable()
export class DashboardStatisticsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly messageRepository: MessageRepository,
    private readonly agentRepository: AgentRepository,
    private readonly reportRepository: ReportRepository,
    private readonly tokenUsageRepository: TokenUsageRepository,
  ) {}

  async execute(
    user: AuthenticatedUser,
    dto: DashboardStatisticsDto,
  ): Promise<DashboardStatistics> {
    const { startDate, endDate } = this.getDateRange(dto);
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);

    const currentStats = await this.getStatistics(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    const previousStats = await this.getStatistics(
      user,
      previousPeriod.start,
      previousPeriod.end,
      dto.agentId,
    );

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
    user: AuthenticatedUser,
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<DashboardStatistics> {
    const organizationId = scopedOrganizationId(user);

    const totalConversations = await this.sessionRepository.countByFilter({
      organizationId,
      agentId,
      createdBetween: [startDate, endDate],
    });

    const reportFilters: ReportFilters = {
      organization_id: organizationId,
      agent_id: agentId,
      startDate,
      endDate,
    };
    const [totalReports, positiveReports] = await Promise.all([
      this.reportRepository.countAll(reportFilters),
      this.reportRepository.countAll({
        ...reportFilters,
        sentiment: 'positive',
      }),
    ]);

    const satisfactionRate =
      totalReports > 0
        ? Math.round((positiveReports / totalReports) * 100)
        : 100;

    const tokenFilters: TokenUsageFilters = {
      start_date: startDate,
      end_date: endDate,
      organization_id: organizationId,
      agent_id: agentId,
    };

    const tokenStats = await this.tokenUsageRepository.getTotals(tokenFilters);
    const tokensUsed = tokenStats.total_tokens;

    const activeAgents =
      await this.agentRepository.countByOrganization(organizationId);

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
