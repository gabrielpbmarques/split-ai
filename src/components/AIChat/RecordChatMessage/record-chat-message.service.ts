import { Injectable } from '@nestjs/common';
import { MessageRepository } from 'src/repositories';

@Injectable()
export class RecordChatMessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(params: {
    sessionId: string;
    userId: string | null;
    agentId: string | null;
    message: string;
    from: 'user' | 'agent';
  }): Promise<void> {
    const { sessionId, userId, agentId, message, from } = params;

    try {
      await this.messageRepository.create({
        session_id: sessionId,
        user_id: userId,
        agent_id: agentId,
        from,
        message,
      });
    } catch (error) {
      // Log error but don't fail the chat flow
      console.error('Failed to record chat message:', error);
    }
  }

  async recordUserMessage(
    sessionId: string,
    userId: string | null,
    agentId: string | null,
    message: string,
  ): Promise<void> {
    return this.execute({
      sessionId,
      userId,
      agentId,
      message,
      from: 'user',
    });
  }

  async recordAgentMessage(
    sessionId: string,
    userId: string | null,
    agentId: string | null,
    message: string,
  ): Promise<void> {
    return this.execute({
      sessionId,
      userId,
      agentId,
      message,
      from: 'agent',
    });
  }
}
