import { Injectable } from '@nestjs/common';

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

@Injectable()
export class DashboardChartsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly messageRepository: MessageRepository,
    private readonly reportRepository: ReportRepository,
  ) {}

  async execute(dto: DashboardChartsDto): Promise<DashboardCharts> {
    const { startDate, endDate } = this.getDateRange(dto);

    const sentimentData = await this.getSentimentData(
      startDate,
      endDate,
      dto.agentId,
    );

    const conversationsData = await this.getConversationsData(
      startDate,
      endDate,
      dto.agentId,
    );

    return {
      sentiment: sentimentData,
      conversations: conversationsData,
    };
  }

  private async getSentimentData(
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<ChartData> {
    const filters: ReportFilters = {
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
    startDate: Date,
    endDate: Date,
    agentId?: string,
  ): Promise<ChartData> {
    const labels: string[] = [];
    const data: number[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.sessionRepository.countByFilter({
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
