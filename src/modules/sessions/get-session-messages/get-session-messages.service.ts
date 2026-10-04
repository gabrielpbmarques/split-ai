import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { CreditTransactionRepository } from 'src/modules/billing/repositories/credit-transaction.repository';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';
import { SessionRepository } from 'src/modules/sessions/repositories/session.repository';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

export interface ConversationDetail {
  session: {
    id: string;
    agent_name: string;
    user_name: string;
    user_email: string;
    created_at: Date;
    remaining_tokens: number;
    tokens_used: number;
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
    private sessionRepository: SessionRepository,
    private messageRepository: MessageRepository,
    private creditTransactionRepository: CreditTransactionRepository,
    private agentRepository: AgentRepository,
    private userRepository: UserRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    user: AuthenticatedUser,
    sessionId: string,
  ): Promise<ConversationDetail> {
    // Get session
    const sessionEntity = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!sessionEntity) {
      throw new NotFoundException('Sessão não encontrada');
    }

    if (sessionEntity.organization_id) {
      this.accessScope.ensureCan(
        user,
        'session.read',
        { organizationId: sessionEntity.organization_id },
        'Acesso negado',
      );
    } else if (
      user.role !== 'admin' &&
      sessionEntity.user_id &&
      sessionEntity.user_id !== user.id
    ) {
      throw new ForbiddenException('Acesso negado');
    }

    // Attempt to get Agent name
    let agentName = 'Unknown Agent';
    if (sessionEntity.agent_id) {
      const agent = await this.agentRepository.findById(sessionEntity.agent_id);
      if (agent) {
        agentName = agent.name;
      }
    }

    // Attempt to get User info
    let userName = 'Anonymous';
    let userEmail = '';
    if (sessionEntity.user_id) {
      const userRes = await this.userRepository.findById(sessionEntity.user_id);
      if (userRes) {
        userName = userRes.name;
        userEmail = userRes.email;
      }
    }

    // Get messages
    const messages = await this.messageRepository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
      select: ['id', 'from', 'message', 'created_at'],
    });

    // Calculate credits used
    const creditsUsed =
      await this.creditTransactionRepository.getSessionConsumption(sessionId);

    return {
      session: {
        id: sessionEntity.id,
        agent_name: agentName,
        user_name: userName,
        user_email: userEmail,
        created_at: sessionEntity.created_at,
        remaining_tokens: 0,
        tokens_used: creditsUsed,
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
