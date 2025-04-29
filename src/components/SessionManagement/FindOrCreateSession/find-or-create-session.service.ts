import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SaveSessionService } from 'src/components/Register/SaveSession/save-session.service';
import { Session } from 'src/models/Session.model';
import { SessionRepository } from 'src/repositories/Session.repository';
import { FindOrCreateSessionDto } from 'src/components/SessionManagement/FindOrCreateSession/find-or-create-session.dto';

interface SessionResponse {
  sessionId: string;
  worker: any;
  isNewUser: boolean;
  lastAiResponse?: string;
}

@Injectable()
export class FindOrCreateSessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly saveSessionService: SaveSessionService,
  ) {}

  async execute(
    findOrCreateSessionDto: FindOrCreateSessionDto,
  ): Promise<SessionResponse> {
    const { sessionId: existingSessionId, phoneNumber } =
      findOrCreateSessionDto;

    let sessionId = existingSessionId;
    let session: Session | null;
    let worker: any;
    let isNewUser = true;

    if (sessionId) {
      session = await this.sessionRepository.findBySessionId(sessionId);
    }

    if (!session && phoneNumber) {
      session = await this.sessionRepository.findByPhoneNumber(phoneNumber);
      if (session) {
        sessionId = session.sessionId;
      }
    }

    let lastAiResponse;

    if (session) {
      worker = session.workerData;
      isNewUser = !worker.userId;
      lastAiResponse = session.lastAiResponse;
    } else {
      sessionId = uuidv4();
      worker = {
        signupStage: 'personal_info',
        createdAt: new Date(),
      };

      await this.saveSessionService.execute(
        sessionId,
        phoneNumber,
        worker,
        lastAiResponse,
      );
    }

    return { sessionId, worker, isNewUser, lastAiResponse };
  }
}
