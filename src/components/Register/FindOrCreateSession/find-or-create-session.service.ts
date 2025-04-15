import { Injectable, Logger } from '@nestjs/common';
import { SessionRepository } from '../../../repositories/Session.repository';
import { FindOrCreateSessionDto } from './find-or-create-session.dto';
import { v4 as uuidv4 } from 'uuid';
import { SaveSessionService } from '../SaveSession/save-session.service';

interface SessionResponse {
  sessionId: string;
  worker: any;
  isNewUser: boolean;
  lastAiResponse?: string; // Última resposta da IA conversacional
}

@Injectable()
export class FindOrCreateSessionService {
  private readonly logger = new Logger(FindOrCreateSessionService.name);
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly saveSessionService: SaveSessionService,
  ) {}

  async execute(
    findOrCreateSessionDto: FindOrCreateSessionDto,
  ): Promise<SessionResponse> {
    this.logger.log(
      `Iniciando busca/criação de sessão para o telefone: ${findOrCreateSessionDto.phoneNumber}`,
    );
    try {
      const { sessionId: existingSessionId, phoneNumber } =
        findOrCreateSessionDto;

      let sessionId = existingSessionId;
      let session;
      let worker: any;
      let isNewUser = true;

      // Se tiver sessionId, busca a sessão existente
      if (sessionId) {
        this.logger.debug(
          `Buscando sessão existente por sessionId: ${sessionId}`,
        );
        session = await this.sessionRepository.findBySessionId(sessionId);
      }

      // Se não encontrou por sessionId, tenta pelo número de telefone
      if (!session && phoneNumber) {
        this.logger.debug(`Buscando sessão por telefone: ${phoneNumber}`);
        session = await this.sessionRepository.findByPhoneNumber(phoneNumber);
        if (session) {
          sessionId = session.sessionId;
          this.logger.log(
            `Sessão encontrada por telefone: ${phoneNumber}, sessionId: ${sessionId}`,
          );
        }
      }

      // Se encontrou uma sessão, recupera os dados do worker e a última resposta da IA
      let lastAiResponse;
      if (session) {
        worker = session.workerData;
        isNewUser = !worker.userId;
        lastAiResponse = session.lastAiResponse;
        this.logger.log(`Sessão recuperada. Usuário é novo? ${isNewUser}`);
      } else {
        // Se não encontrou sessão, cria um worker temporário
        this.logger.log(
          'Nenhuma sessão encontrada. Criando nova sessão e worker temporário.',
        );
        sessionId = uuidv4();
        worker = {
          signupStage: 'personal_info',
          createdAt: new Date(),
        };

        // Cria a sessão no banco
        try {
          await this.saveSessionService.execute(
            sessionId,
            phoneNumber,
            worker,
            lastAiResponse,
          );
          this.logger.log(
            `Nova sessão criada com sessionId: ${sessionId} para telefone: ${phoneNumber}`,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao criar sessão no banco: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }

      this.logger.debug(
        `Retornando sessãoId: ${sessionId}, isNewUser: ${isNewUser}`,
      );
      return { sessionId, worker, isNewUser, lastAiResponse };
    } catch (error) {
      this.logger.error(
        `Erro inesperado ao buscar/criar sessão para telefone: ${findOrCreateSessionDto.phoneNumber}. Erro: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
