import { Injectable } from '@nestjs/common';

import type { ReportEntity } from 'src/infrastructure/database/schema/report.entity';
import type { ListReportsDto } from 'src/modules/reports/list-reports/list-reports.dto';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ListReportsService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(dto: ListReportsDto): Promise<PaginatedResponse<ReportEntity>> {
    const page = await this.reportRepository.listPaginated(
      {
        sentiment: dto.sentiment,
        type: dto.type,
        agent_id: dto.agent_id,
        agent_ids: dto.agent_ids,
        createdAtDay: dto.created_at ? new Date(dto.created_at) : undefined,
      },
      dto,
    );
    return toPaginatedResponse(page, dto);
  }
}
