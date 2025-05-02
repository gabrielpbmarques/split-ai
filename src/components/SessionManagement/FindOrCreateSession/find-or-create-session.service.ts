import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FindOrCreateSessionDto } from 'src/components/SessionManagement/FindOrCreateSession/find-or-create-session.dto';
import { Session } from 'src/models/Session.model';
import { SessionRepository } from 'src/repositories/Session.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { filterSessionWorkerData } from 'src/models/SessionWorkerData.model';

interface SessionResponse {
  sessionId: string;
  worker: any; // Mantendo como any para compatibilidade com o código existente
  isNewUser: boolean;
  lastAiResponse?: string;
}

@Injectable()
export class FindOrCreateSessionService {
  private readonly logger = new Logger(FindOrCreateSessionService.name);

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly workerRepository: WorkerRepository,
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

    let lastAiResponse: string | undefined;

    if (session) {
      worker = session.workerData;
      isNewUser = !worker._id;
      lastAiResponse = session.lastAiResponse;

      if (worker._id) {
        try {
          const dbWorker = await this.workerRepository.findById(worker._id);
          if (dbWorker) {
            if (dbWorker.documents?.documentValidationResult) {
              worker.documents = worker.documents || {};
              worker.documents.documentValidationResult =
                dbWorker.documents.documentValidationResult;
              this.logger.log(
                `Dados de validação de documentos adicionados para worker: ${worker._id}`,
              );
            }
          }
        } catch (error) {
          this.logger.error(`Erro ao buscar dados do worker: ${error.message}`);
        }
      }
    } else {
      sessionId = uuidv4();
      worker = {
        signupStage: 'personal_info',
        createdAt: new Date(),
      };

      await this.sessionRepository.create({
        sessionId,
        phoneNumber,
        workerData: filterSessionWorkerData(worker),
        lastInteraction: new Date(),
      });
    }

    return {
      sessionId,
      worker,
      isNewUser,
      lastAiResponse,
    };
  }
}
