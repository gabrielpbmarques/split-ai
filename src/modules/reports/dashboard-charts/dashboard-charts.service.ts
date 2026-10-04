import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import {
  type TokenUsageFilters,
  TokenUsageRepository,
} from 'src/modules/billing/repositories/token-usage.repository';
import type {
  DashboardChartsDto,
  DashboardCharts,
  ChartData,
} from 'src/modules/reports/dashboard-charts/dashboard-charts.dto';
import {
  type ReportFilters,
  ReportRepository,
} from 'src/modules/reports/repositories/report.repository';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';
import { SessionRepository } from 'src/modules/sessions/repositories/session.repository';
import { scopedOrganizationId } from 'src/shared/utils/scoped-organization-id';

@Injectable()
export class DashboardChartsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly messageRepository: MessageRepository,
    private readonly reportRepository: ReportRepository,
    private readonly tokenUsageRepository: TokenUsageRepository,
  ) {}

  async execute(
    user: AuthenticatedUser,
    dto: DashboardChartsDto,
  ): Promise<DashboardCharts> {
    const { startDate, endDate } = this.getDateRange(dto);

    const sentimentData = await this.getSentimentData(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    const conversationsData = await this.getConversationsData(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    const tokensData = await this.getTokensData(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    return {
      sentiment: sentimentData,
      conversations: conversationsData,
      tokens: tokensData,
    };
  }

  private async getSentimentData(
    user: AuthenticatedUser,
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<ChartData> {
    const filters: ReportFilters = {
      organization_id: scopedOrganizationId(user),
      agent_id: agentId,
      startDate,
      endDate,
    };
    const [positive, negative, neutral] = await Promise.all([
      this.reportRepository.countAll({ ...filters, sentiment: 'positive' }),
      this.reportRepository.countAll({ ...filters, sentiment: 'negative' }),
      this.reportRepository.countAll({ ...filters, sentiment: 'neutral' }),
    ]);

    return {
      labels: ['Positivo', 'Neutro', 'Negativo'],
      datasets: [
        {
          data: [positive, neutral, negative],
          backgroundColor: ['#2ECC71', '#F1C40F', '#E74C3C'],
        },
      ],
    };
  }

  private async getConversationsData(
    user: AuthenticatedUser,
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<ChartData> {
    const labels: string[] = [];
    const data: number[] = [];
    const organizationId = scopedOrganizationId(user);

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.sessionRepository.countByFilter({
        organizationId,
        agentId,
        createdBetween: [dayStart, dayEnd],
      });

      labels.push(
        currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
      );
      data.push(count);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const limitedLabels = labels.slice(-7);
    const limitedData = data.slice(-7);

    return {
      labels: limitedLabels,
      datasets: [
        {
          label: 'Conversas',
          data: limitedData,
          borderColor: '#8B3FE4',
          backgroundColor: 'rgba(139, 63, 228, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }

  private async getTokensData(
    user: AuthenticatedUser,
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<ChartData> {
    const labels: string[] = [];
    const data: number[] = [];
    const organizationId = scopedOrganizationId(user);

    const monthsToShow = 6;
    const currentDate = new Date(endDate);
    currentDate.setMonth(currentDate.getMonth() - monthsToShow + 1);

    for (let i = 0; i < monthsToShow; i++) {
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const tokenFilters: TokenUsageFilters = {
        start_date: monthStart,
        end_date: monthEnd,
        organization_id: organizationId,
        agent_id: agentId,
      };

      const tokenStats =
        await this.tokenUsageRepository.getTotals(tokenFilters);
      const tokens = tokenStats.total_tokens;

      labels.push(monthStart.toLocaleDateString('pt-BR', { month: 'short' }));
      data.push(Math.round(tokens / 1000));

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Tokens (milhares)',
          data,
          backgroundColor: '#E14C9A',
        },
      ],
    };
  }

  private getDateRange(dto: DashboardChartsDto): {
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
}
