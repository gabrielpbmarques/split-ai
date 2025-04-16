import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';

@Injectable()
export class SaveSessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    sessionId: string,
    phoneNumber: string,
    workerData: any,
    lastAiResponse?: string,
  ): Promise<void> {
    const existingSession =
      await this.sessionRepository.findBySessionId(sessionId);

    if (existingSession) {
      await this.sessionRepository.update(sessionId, {
        workerData,
        lastInteraction: new Date(),
        lastAiResponse,
      });
    } else {
      await this.sessionRepository.create({
        sessionId,
        phoneNumber,
        workerData,
        lastInteraction: new Date(),
        lastAiResponse,
        createdAt: new Date(),
      });
    }
  }
}
