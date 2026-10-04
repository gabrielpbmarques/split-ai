import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ListSessionsDto } from 'src/modules/sessions/list-sessions/list-sessions.dto';
import {
  SessionRepository,
  SessionSummaryRow,
} from 'src/modules/sessions/repositories/session.repository';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ListSessionsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    user: AuthenticatedUser,
    dto: ListSessionsDto,
  ): Promise<PaginatedResponse<SessionSummaryRow>> {
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !user.organization_id) {
      return toPaginatedResponse({ items: [], total: 0 }, dto);
    }

    const page = await this.sessionRepository.listSummariesPaginated(
      {
        organizationId: isAdmin ? undefined : user.organization_id,
        ownUserId: isAdmin ? undefined : user.id,
        agentId: dto.agent_id,
        userId: isAdmin ? dto.user_id : undefined,
        startDate: dto.start_date,
        endDate: dto.end_date,
      },
      dto,
    );
    return toPaginatedResponse(page, dto);
  }
}
