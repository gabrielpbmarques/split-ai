import { Injectable } from '@nestjs/common';
import { Between, In } from 'typeorm';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ReportEntity } from 'src/infrastructure/database/schema/report.entity';
import { ListReportsDto } from 'src/modules/reports/list-reports/list-reports.dto';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';

@Injectable()
export class ListReportsService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(
    user: AuthenticatedUser,
    dto: ListReportsDto,
  ): Promise<ReportEntity[]> {
    const where: any = {};

    // Organization scope (keep existing behavior)
    where.organization_id = user.role === 'admin' ? null : user.organization_id;

    if (dto.sentiment) where.sentiment = dto.sentiment;
    if (dto.type) where.type = dto.type;

    // Agent filters: support single or multiple
    const agentIds = Array.isArray(dto.agent_ids)
      ? dto.agent_ids
      : dto.agent_ids
        ? [dto.agent_ids]
        : [];

    if (agentIds.length > 0) {
      where.agent_id = In(agentIds);
    } else if (dto.agent_id) {
      where.agent_id = dto.agent_id;
    }

    // Date filter by day (treat created_at as a date string or Date)
    if (dto.created_at) {
      const d = new Date(dto.created_at as any);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      where.created_at = Between(start, end);
    }

    return this.reportRepository.find({
      where,
      order: {
        created_at: 'DESC',
      },
    });
  }
}
