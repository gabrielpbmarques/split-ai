import { Injectable } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';

@Injectable()
export class UpdateLastAiResponseService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionId: string, lastAiResponse: string): Promise<void> {
    try {
      // Busca a sessão pelo ID
      const session = await this.sessionRepository.findBySessionId(sessionId);

      if (session) {
        // Atualiza a última resposta da IA e a data da última interação
        await this.sessionRepository.update(session._id.toString(), {
          lastAiResponse: lastAiResponse,
          lastInteraction: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar a última resposta da IA:', error);
    }
  }
}
