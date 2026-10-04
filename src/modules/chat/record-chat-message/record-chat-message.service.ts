import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  EMBEDDINGS,
  type EmbeddingsGateway,
} from 'src/infrastructure/integration/embeddings.port';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';

@Injectable()
export class RecordChatMessageService {
  private readonly logger = new Logger(RecordChatMessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    @Inject(EMBEDDINGS) private readonly embeddings: EmbeddingsGateway,
  ) {}

  async execute(
    sessionId: string,
    userId: string | null,
    agentId: string | null,
    message: string,
    from: 'user' | 'agent',
  ): Promise<void> {
    try {
      const embedding = await this.embeddings.embedQuery(message);
      await this.messageRepository.create({
        session_id: sessionId,
        user_id: userId,
        agent_id: agentId,
        from,
        message,
        embedding,
      });
    } catch (error) {
      this.logger.error('Failed to record chat message', error);
    }
  }
}
