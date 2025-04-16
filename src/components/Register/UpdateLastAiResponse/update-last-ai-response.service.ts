import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';

@Injectable()
export class UpdateLastAiResponseService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionId: string, lastAiResponse: string): Promise<void> {
    const session = await this.sessionRepository.findBySessionId(sessionId);

    if (session) {
      await this.sessionRepository.update(session._id.toString(), {
        lastAiResponse: lastAiResponse,
        lastInteraction: new Date(),
      });
    }
  }
}
