import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, type FindOptionsWhere, MoreThan, Repository } from 'typeorm';

import { SessionEntity } from 'src/infrastructure/database/schema/session.entity';
import {
  type PageRequest,
  type PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

export interface SessionCountFilter {
  readonly organizationId?: string;
  readonly agentId?: string;
  readonly createdBetween?: readonly [Date, Date];
}

export interface SessionListFilter {
  readonly organizationId?: string;
  readonly ownUserId?: string;
  readonly agentId?: string;
  readonly userId?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export interface SessionSummaryRow {
  id: string;
  agent_id: string;
  agent_name: string | null;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  created_at: Date;
  expires_at: Date;
  expired: boolean;
  message_count: number;
  last_message: string | null;
  last_message_at: Date | null;
}

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>,
  ) {}

  async create(data: Partial<SessionEntity>): Promise<SessionEntity> {
    return this.repository.save(this.repository.create(data));
  }

  async findById(id: string): Promise<SessionEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async countByFilter(filter: SessionCountFilter): Promise<number> {
    const where: FindOptionsWhere<SessionEntity> = {};
    if (filter.organizationId) where.organization_id = filter.organizationId;
    if (filter.agentId) where.agent_id = filter.agentId;
    if (filter.createdBetween) {
      where.created_at = Between(...filter.createdBetween);
    }

    return this.repository.count({ where });
  }

  async listSummariesPaginated(
    filter: SessionListFilter,
    page: PageRequest,
  ): Promise<PageResult<SessionSummaryRow>> {
    const query = this.repository
      .createQueryBuilder('s')
      .leftJoin('agents', 'a', 'a.id::text = s.agent_id')
      .leftJoin('users', 'u', 'u.id::text = s.user_id')
      .select([
        's.id AS id',
        's.agent_id AS agent_id',
        's.user_id AS user_id',
        's.created_at AS created_at',
        's.expires_at AS expires_at',
        's.expired AS expired',
        'a.name AS agent_name',
        'u.name AS user_name',
        'u.email AS user_email',
        'u.phone AS user_phone',
      ])
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)::int', 'message_count')
            .from('messages', 'm')
            .where('m.session_id = s.id'),
        'message_count',
      )
      .addSelect(
        (sub) =>
          sub
            .select('m.message', 'last_message')
            .from('messages', 'm')
            .where('m.session_id = s.id')
            .orderBy('m.created_at', 'DESC')
            .limit(1),
        'last_message',
      )
      .addSelect(
        (sub) =>
          sub
            .select('m.created_at', 'last_message_at')
            .from('messages', 'm')
            .where('m.session_id = s.id')
            .orderBy('m.created_at', 'DESC')
            .limit(1),
        'last_message_at',
      )
      .where('1=1');

    if (filter.organizationId) {
      query.andWhere(
        '(s.organization_id = :orgId OR (s.organization_id IS NULL AND s.user_id = :ownUserId))',
        { orgId: filter.organizationId, ownUserId: filter.ownUserId },
      );
    }
    if (filter.agentId) {
      query.andWhere('s.agent_id = :agentId', { agentId: filter.agentId });
    }
    if (filter.userId) {
      query.andWhere('s.user_id = :userId', { userId: filter.userId });
    }
    if (filter.startDate) {
      query.andWhere('s.created_at >= :start', { start: filter.startDate });
    }
    if (filter.endDate) {
      query.andWhere('s.created_at <= :end', { end: filter.endDate });
    }

    const countQuery = query.clone();
    query
      .orderBy('s.created_at', 'DESC')
      .offset(skipOf(page))
      .limit(page.limit);

    const [items, total] = await Promise.all([
      query.getRawMany<SessionSummaryRow>(),
      countQuery.getCount(),
    ]);

    return { items, total };
  }

  async findActiveSessionByUserAndAgent(
    userId: string,
    agentId: string,
  ): Promise<SessionEntity | null> {
    return this.repository.findOne({
      where: {
        user_id: userId,
        agent_id: agentId,
        expires_at: MoreThan(new Date()),
        expired: false,
      },
    });
  }

  async updateExpiredSession(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, { expired: true });
  }

  async expireAllSessionsByUserId(userId: string): Promise<void> {
    await this.repository.update({ user_id: userId }, { expired: true });
  }
}
