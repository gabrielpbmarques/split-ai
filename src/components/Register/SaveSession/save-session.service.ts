import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';

@Injectable()
export class SaveSessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    sessionId: string,
    phoneNumber: string,
    workerData: any,
  ): Promise<void> {
    try {
      const existingSession =
        await this.sessionRepository.findBySessionId(sessionId);

      if (existingSession) {
        // Atualiza a sessão
        await this.sessionRepository.update(sessionId, {
          workerData,
          lastInteraction: new Date(),
        });
      } else {
        // Cria a sessão
        await this.sessionRepository.create({
          sessionId,
          phoneNumber,
          workerData,
          lastInteraction: new Date(),
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  }
}
