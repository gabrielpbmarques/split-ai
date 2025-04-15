import { Injectable, Logger } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';

@Injectable()
export class SaveSessionService {
  private readonly logger = new Logger(SaveSessionService.name);
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    sessionId: string,
    phoneNumber: string,
    workerData: any,
    lastAiResponse?: string,
  ): Promise<void> {
    this.logger.log(
      `Salvando sessão para sessionId: ${sessionId}, telefone: ${phoneNumber}`,
    );
    try {
      const existingSession =
        await this.sessionRepository.findBySessionId(sessionId);

      if (existingSession) {
        await this.sessionRepository.update(sessionId, {
          workerData,
          lastInteraction: new Date(),
          lastAiResponse,
        });
        this.logger.debug('Sessão existente atualizada com sucesso.');
      } else {
        await this.sessionRepository.create({
          sessionId,
          phoneNumber,
          workerData,
          lastInteraction: new Date(),
          lastAiResponse,
          createdAt: new Date(),
        });
        this.logger.debug('Nova sessão criada com sucesso.');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao salvar sessão para sessionId: ${sessionId}, telefone: ${phoneNumber}. Erro: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
