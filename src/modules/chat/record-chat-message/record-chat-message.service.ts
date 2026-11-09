import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  EMBEDDINGS_SERVICE,
  type IEmbeddingsService,
} from 'src/infrastructure/providers/voyage.provider';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';

@Injectable()
export class RecordChatMessageService {
  private readonly logger = new Logger(RecordChatMessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    @Inject(EMBEDDINGS_SERVICE)
    private readonly embeddings: IEmbeddingsService,
  ) {}

  async execute(
    sessionId: string,
    userId: string | null,
    agentId: string | null,
    message: string,
    from: 'user' | 'agent',
  ): Promise<void> {
    let embedding: number[] | null = null;

    try {
      const textToEmbed =
        message.length > 32000 ? message.slice(0, 32000) : message;
      embedding = await this.embeddings.embedQuery(textToEmbed);
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : error },
        'Failed to generate embedding for chat message, recording without embedding',
      );
    }

    try {
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
