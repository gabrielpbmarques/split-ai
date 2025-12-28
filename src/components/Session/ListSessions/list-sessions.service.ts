import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/repositories';

import { ListSessionsDto, SessionsListResponse } from './list-sessions.dto';

interface AuthUser {
  id: string;
  role: string;
  organization_id: string;
}

@Injectable()
export class ListSessionsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    user: AuthUser,
    dto: ListSessionsDto,
  ): Promise<SessionsListResponse> {
    const query = this.sessionRepository
      .createQueryBuilder('s')
      .leftJoin('agents', 'a', 'a.id::text = s.agent_id')
      .leftJoin('users', 'u', 'u.id::text = s.user_id')
      .select([
        's.id as id',
        's.agent_id as agent_id',
        's.user_id as user_id',
        's.organization_id as organization_id',
        's.created_at as created_at',
        's.expires_at as expires_at',
        's.expired as expired',
        'a.name as agent_name',
        'u.name as user_name',
        'u.email as user_email',
        'u.phone as user_phone',
      ]);

    // Apply organization scoping for non-admin users
    if (user.role !== 'admin' && user.organization_id) {
      query.where(
        '(s.organization_id = :orgId OR (s.organization_id IS NULL AND s.user_id = :userId))',
        {
          orgId: user.organization_id,
          userId: user.id,
        },
      );
    } else if (user.role === 'admin') {
      query.where('1=1');
    } else {
      return {
        sessions: [],
        pagination: {
          page: dto.page || 1,
          limit: dto.limit || 20,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Apply filters
    if (dto.agent_id) {
      query.andWhere('s.agent_id = :agentId', { agentId: dto.agent_id });
    }

    if (dto.user_id && user.role === 'admin') {
      query.andWhere('s.user_id = :userId', { userId: dto.user_id });
    }

    if (dto.start_date) {
      query.andWhere('s.created_at >= :start', { start: dto.start_date });
    }

    if (dto.end_date) {
      query.andWhere('s.created_at <= :end', { end: dto.end_date });
    }

    // Add message count subquery
    query.addSelect((subQuery) => {
      return subQuery
        .select('COUNT(*)', 'message_count')
        .from('messages', 'm')
        .where('m.session_id = s.id');
    }, 'message_count');

    // Add last message subquery
    query.addSelect((subQuery) => {
      return subQuery
        .select('m.message', 'last_message')
        .from('messages', 'm')
        .where('m.session_id = s.id')
        .orderBy('m.created_at', 'DESC')
        .limit(1);
    }, 'last_message');

    // Add last message timestamp subquery
    query.addSelect((subQuery) => {
      return subQuery
        .select('m.created_at', 'last_message_at')
        .from('messages', 'm')
        .where('m.session_id = s.id')
        .orderBy('m.created_at', 'DESC')
        .limit(1);
    }, 'last_message_at');

    // Order by created_at descending
    query.orderBy('s.created_at', 'DESC');

    // Clone query for count
    const countQuery = query.clone();

    // Apply pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    query.offset(skip).limit(limit);

    // Execute queries
    const [sessionsRaw, total] = await Promise.all([
      query.getRawMany(),
      countQuery.getCount(),
    ]);

    // Transform raw results
    const sessions = sessionsRaw.map((session) => ({
      id: session.id,
      agent_id: session.agent_id,
      agent_name: session.agent_name || 'Unknown Agent',
      user_id: session.user_id,
      user_name: session.user_name || 'Anonymous',
      user_email: session.user_email || '',
      user_phone: session.user_phone || undefined,
      created_at: session.created_at,
      expires_at: session.expires_at,
      expired: session.expired,
      message_count: parseInt(session.message_count) || 0,
      last_message: session.last_message || undefined,
      last_message_at: session.last_message_at || undefined,
    }));

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
