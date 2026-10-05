import { Injectable } from '@nestjs/common';

import type {
  GetDashboardDataDto,
  ReportSentiment,
  ReportType,
} from 'src/modules/reports/get-dashboard-data/get-dashboard-data.dto';
import {
  type ReportFilters,
  ReportRepository,
} from 'src/modules/reports/repositories/report.repository';

export interface DashboardData {
  totalVolume: number;
  byType: Record<ReportType, number>;
  bySentiment: Record<ReportSentiment, number>;
  appointmentConversion: {
    totalAppointments: number;
    scheduledAppointments: number;
    rate: number;
  };
}

@Injectable()
export class GetDashboardDataService {
  constructor(private readonly reportRepository: ReportRepository) {}

  private parseFilters(query: GetDashboardDataDto): ReportFilters {
    const filters: ReportFilters = {};

    if (query.agent_ids) {
      const arr = Array.isArray(query.agent_ids)
        ? query.agent_ids
        : String(query.agent_ids)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      if (arr.length > 0) filters.agent_ids = arr;
    } else if (query.agent_id) {
      filters.agent_id = String(query.agent_id);
    }

    if (query.sentiment) filters.sentiment = query.sentiment;
    if (query.type) filters.type = query.type;

    if (query.created_at) {
      const d = new Date(query.created_at);
      if (!isNaN(d.getTime())) filters.createdAtDay = d;
    } else {
      if (query.start) {
        const s = new Date(query.start);
        if (!isNaN(s.getTime())) filters.startDate = s;
      }
      if (query.end) {
        const e = new Date(query.end);
        if (!isNaN(e.getTime())) filters.endDate = e;
      }
    }

    return filters;
  }

  async execute(query: GetDashboardDataDto): Promise<DashboardData> {
    const filters = this.parseFilters(query);

    const totalVolume = await this.reportRepository.countAll(filters);

    const typeRows = await this.reportRepository.groupCountBy('type', filters);
    const byType: Record<ReportType, number> = {
      appointment: 0,
      order: 0,
      faq: 0,
    };
    for (const row of typeRows) {
      if (row.key in byType) byType[row.key as keyof typeof byType] = row.count;
    }

    const sentimentRows = await this.reportRepository.groupCountBy(
      'sentiment',
      filters,
    );
    const bySentiment: Record<ReportSentiment, number> = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };
    for (const row of sentimentRows) {
      if (row.key in bySentiment)
        bySentiment[row.key as keyof typeof bySentiment] = row.count;
    }

    const totalAppointments =
      await this.reportRepository.countAppointments(filters);
    const scheduledAppointments = await this.reportRepository.countAppointments(
      filters,
      true,
    );
    const rate =
      totalAppointments > 0 ? scheduledAppointments / totalAppointments : 0;

    return {
      totalVolume,
      byType,
      bySentiment,
      appointmentConversion: {
        totalAppointments,
        scheduledAppointments,
        rate,
      },
    };
  }
}
