import { Injectable } from '@nestjs/common';
import { Between } from 'typeorm';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { TokenUsageRepository } from 'src/modules/billing/repositories/token-usage.repository';
import {
  DashboardChartsDto,
  DashboardCharts,
  ChartData,
} from 'src/modules/reports/dashboard-charts/dashboard-charts.dto';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';
import { SessionRepository } from 'src/modules/sessions/repositories/session.repository';

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

    // Get sentiment data
    const sentimentData = await this.getSentimentData(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    // Get conversations data
    const conversationsData = await this.getConversationsData(
      user,
      startDate,
      endDate,
      dto.agentId,
    );

    // Get tokens data
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
    const where: any = {
      created_at: Between(startDate, endDate),
    };

    if (user.role !== 'admin' && user.organization_id) {
      where.organization_id = user.organization_id;
    }

    if (agentId) {
      where.agent_id = agentId;
    }

    // Get sentiment counts from reports
    const [positive, negative, neutral] = await Promise.all([
      this.reportRepository.count({
        where: { ...where, sentiment: 'positive' },
      }),
      this.reportRepository.count({
        where: { ...where, sentiment: 'negative' },
      }),
      this.reportRepository.count({
        where: { ...where, sentiment: 'neutral' },
      }),
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
    const labels = [];
    const data = [];

    // Generate daily labels and get counts
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const where: any = {
        created_at: Between(dayStart, dayEnd),
      };

      if (user.role !== 'admin' && user.organization_id) {
        where.organization_id = user.organization_id;
      }

      if (agentId) {
        where.agent_id = agentId;
      }

      const count = await this.sessionRepository.count({ where });

      labels.push(
        currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
      );
      data.push(count);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Limit to last 7 days for readability
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
    const labels = [];
    const data = [];

    // Get monthly data for last 6 months
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

      // Build query with proper joins
      const tokenFilters: any = {
        start_date: monthStart,
        end_date: monthEnd,
      };

      if (user.role !== 'admin' && user.organization_id) {
        tokenFilters.organization_id = user.organization_id;
      }

      if (agentId) {
        tokenFilters.agent_id = agentId;
      }

      const tokenStats =
        await this.tokenUsageRepository.getTotals(tokenFilters);
      const tokens = tokenStats.total_tokens;

      labels.push(monthStart.toLocaleDateString('pt-BR', { month: 'short' }));
      data.push(Math.round(tokens / 1000)); // Convert to thousands

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
