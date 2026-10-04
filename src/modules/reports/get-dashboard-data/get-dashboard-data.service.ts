import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetDashboardDataDto } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.dto';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';

@Injectable()
export class GetDashboardDataService {
  constructor(private readonly reportRepository: ReportRepository) {}

  private parseFilters(user: AuthenticatedUser, query: any) {
    const filters: any = {};

    // Organization scoping
    if (user.role !== 'admin') {
      if (user.organization_id) {
        filters.organization_id = user.organization_id;
      }
    } else if (query.organization_id) {
      filters.organization_id = String(query.organization_id);
    }

    // Agents (single or multiple)
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

    // Optional categorical filters
    if (query.sentiment) filters.sentiment = String(query.sentiment);
    if (query.type) filters.type = String(query.type);

    // Date filters: support created_at (single day) or start/end
    if (query.created_at) {
      const d = new Date(query.created_at as any);
      if (!isNaN(d.getTime())) filters.createdAtDay = d;
    } else {
      if (query.start) {
        const s = new Date(query.start as any);
        if (!isNaN(s.getTime())) filters.startDate = s;
      }
      if (query.end) {
        const e = new Date(query.end as any);
        if (!isNaN(e.getTime())) filters.endDate = e;
      }
    }

    return filters;
  }

  async execute(
    user: AuthenticatedUser,
    query: GetDashboardDataDto,
  ): Promise<any> {
    const filters = this.parseFilters(user, query);

    // 1) Volume total
    const totalVolume = await this.reportRepository.countAll(filters);

    // 2) Distribuição por tipo
    const typeRows = await this.reportRepository.groupCountBy('type', filters);
    const byType: Record<'appointment' | 'order' | 'faq', number> = {
      appointment: 0,
      order: 0,
      faq: 0,
    };
    for (const row of typeRows) {
      if (row.key in byType) byType[row.key as keyof typeof byType] = row.count;
    }

    // 3) Sentimento
    const sentimentRows = await this.reportRepository.groupCountBy(
      'sentiment',
      filters,
    );
    const bySentiment: Record<'positive' | 'negative' | 'neutral', number> = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };
    for (const row of sentimentRows) {
      if (row.key in bySentiment)
        bySentiment[row.key as keyof typeof bySentiment] = row.count;
    }

    // 4) Conversão em agendamento
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
