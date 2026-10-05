import { Injectable } from '@nestjs/common';

import type { ListSessionsDto } from 'src/modules/sessions/list-sessions/list-sessions.dto';
import {
  SessionRepository,
  type SessionSummaryRow,
} from 'src/modules/sessions/repositories/session.repository';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ListSessionsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    dto: ListSessionsDto,
  ): Promise<PaginatedResponse<SessionSummaryRow>> {
    const page = await this.sessionRepository.listSummariesPaginated(
      {
        agentId: dto.agent_id,
        userId: dto.user_id,
        startDate: dto.start_date,
        endDate: dto.end_date,
      },
      dto,
    );
    return toPaginatedResponse(page, dto);
  }
}
