import { Injectable, NotFoundException } from '@nestjs/common';

import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
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
  };
  messages: {
    id: string;
    from: 'user' | 'agent';
    message: string;
    created_at: Date;
  }[];
}

const MESSAGE_FIELDS = ['id', 'from', 'message', 'created_at'] as const;

@Injectable()
export class GetSessionMessagesService {
  constructor(
    private sessionRepository: SessionRepository,
    private messageRepository: MessageRepository,
    private agentRepository: AgentRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(sessionId: string): Promise<ConversationDetail> {
    const sessionEntity = await this.sessionRepository.findById(sessionId);

    if (!sessionEntity) {
      throw new NotFoundException('Sessão não encontrada');
    }

    let agentName = 'Unknown Agent';
    if (sessionEntity.agent_id) {
      const agent = await this.agentRepository.findById(sessionEntity.agent_id);
      if (agent) {
        agentName = agent.name;
      }
    }

    let userName = 'Anonymous';
    let userEmail = '';
    if (sessionEntity.user_id) {
      const userRes = await this.userRepository.findById(sessionEntity.user_id);
      if (userRes) {
        userName = userRes.name;
        userEmail = userRes.email;
      }
    }

    const messages = await this.messageRepository.listBySession(
      sessionId,
      MESSAGE_FIELDS,
    );

    return {
      session: {
        id: sessionEntity.id,
        agent_name: agentName,
        user_name: userName,
        user_email: userEmail,
        created_at: sessionEntity.created_at,
      },
      messages,
    };
  }
}
