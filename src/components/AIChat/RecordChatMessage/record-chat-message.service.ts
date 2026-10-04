import { Injectable, Logger } from '@nestjs/common';
import { MessageRepository } from 'src/repositories';

@Injectable()
export class RecordChatMessageService {
  private readonly logger = new Logger(RecordChatMessageService.name);

  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(
    sessionId: string,
    userId: string | null,
    agentId: string | null,
    message: string,
    from: 'user' | 'agent',
  ): Promise<void> {
    try {
      await this.messageRepository.create({
        session_id: sessionId,
        user_id: userId,
        agent_id: agentId,
        from,
        message,
      });
    } catch (error: any) {
      this.logger.error('Failed to record chat message', error);
    }
  }
}
