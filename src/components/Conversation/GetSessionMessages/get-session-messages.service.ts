import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity, SessionEntity } from 'src/entities';
import { Repository } from 'typeorm';

interface AuthUser {
  id: string;
  role: string;
  organization_id: string;
}

export interface ConversationDetail {
  session: {
    id: string;
    agent_name: string;
    user_name: string;
    user_email: string;
    created_at: Date;
  };
  messages: {
    id: string;
    from: 'user' | 'agent';
    message: string;
    created_at: Date;
  }[];
}

@Injectable()
export class GetSessionMessagesService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
  ) {}

  async execute(
    user: AuthUser,
    sessionId: string,
  ): Promise<ConversationDetail> {
    // Get session with agent and user info
    const session = await this.sessionRepository
      .createQueryBuilder('s')
      .leftJoin('agents', 'a', 'a.id = s.agent_id')
      .leftJoin('users', 'u', 'u.id = s.user_id')
      .where('s.id = :sessionId', { sessionId })
      .select([
        's.id as id',
        's.created_at as created_at',
        's.organization_id as organization_id',
        'a.name as agent_name',
        'u.name as user_name',
        'u.email as user_email',
      ])
      .getRawOne();

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    // Check permission
    if (
      user.role !== 'admin' &&
      session.organization_id !== user.organization_id
    ) {
      throw new ForbiddenException('Acesso negado');
    }

    // Get messages
    const messages = await this.messageRepository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
      select: ['id', 'from', 'message', 'created_at'],
    });

    return {
      session: {
        id: session.id,
        agent_name: session.agent_name || 'Unknown Agent',
        user_name: session.user_name || 'Anonymous',
        user_email: session.user_email || '',
        created_at: session.created_at,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        from: msg.from as 'user' | 'agent',
        message: msg.message,
        created_at: msg.created_at,
      })),
    };
  }
}
