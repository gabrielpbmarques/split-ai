import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../../repositories/Session.repository';
import { FindOrCreateSessionDto } from './find-or-create-session.dto';
import { v4 as uuidv4 } from 'uuid';

interface SessionResponse {
  sessionId: string;
  worker: any;
  isNewUser: boolean;
}

@Injectable()
export class FindOrCreateSessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    findOrCreateSessionDto: FindOrCreateSessionDto,
  ): Promise<SessionResponse> {
    const { sessionId: existingSessionId, phoneNumber } =
      findOrCreateSessionDto;

    let sessionId = existingSessionId;
    let session;
    let worker: any;
    let isNewUser = true;

    // Se tiver sessionId, busca a sessão existente
    if (sessionId) {
      session = await this.sessionRepository.findBySessionId(sessionId);
    }

    // Se não encontrou por sessionId, tenta pelo número de telefone
    if (!session && phoneNumber) {
      session = await this.sessionRepository.findByPhoneNumber(phoneNumber);
      if (session) {
        sessionId = session.sessionId;
      }
    }

    // Se encontrou uma sessão, recupera os dados do worker
    if (session) {
      worker = session.workerData;
      console.log('Sessão existente encontrada:', sessionId);
      isNewUser = !worker.userId;
    } else {
      // Se não encontrou sessão, cria um worker temporário
      sessionId = uuidv4();
      worker = {
        signupStage: 'personal_info',
        createdAt: new Date(),
      };
      console.log('Nova sessão criada:', sessionId);

      // Cria a sessão no banco
      await this.saveSession(sessionId, phoneNumber, worker);
    }

    return { sessionId, worker, isNewUser };
  }

  private async saveSession(
    sessionId: string,
    phoneNumber: string,
    workerData: any,
  ): Promise<void> {
    try {
      await this.sessionRepository.create({
        sessionId,
        phoneNumber,
        workerData,
        lastInteraction: new Date(),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  }
}
