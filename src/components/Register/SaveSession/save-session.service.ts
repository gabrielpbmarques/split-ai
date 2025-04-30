import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';
import { filterSessionWorkerData } from 'src/models/SessionWorkerData.model';

@Injectable()
export class SaveSessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    sessionId: string,
    phoneNumber: string,
    workerData: any,
    lastAiResponse?: string,
  ): Promise<void> {
    const filteredWorkerData = filterSessionWorkerData(workerData);

    const existingSession =
      await this.sessionRepository.findBySessionId(sessionId);

    if (existingSession) {
      await this.sessionRepository.update(sessionId, {
        workerData: filteredWorkerData,
        lastInteraction: new Date(),
        lastAiResponse,
      });
    } else {
      await this.sessionRepository.create({
        sessionId,
        phoneNumber,
        workerData: filteredWorkerData,
        lastInteraction: new Date(),
        lastAiResponse,
        createdAt: new Date(),
      });
    }
  }
}
