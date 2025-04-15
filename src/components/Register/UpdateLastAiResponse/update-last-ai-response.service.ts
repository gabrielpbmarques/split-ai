import { Injectable, Logger } from '@nestjs/common';
import { SessionRepository } from 'src/repositories/Session.repository';

@Injectable()
export class UpdateLastAiResponseService {
  private readonly logger = new Logger(UpdateLastAiResponseService.name);
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionId: string, lastAiResponse: string): Promise<void> {
    this.logger.log(
      `Atualizando última resposta da IA para a sessão: ${sessionId}`,
    );
    try {
      // Busca a sessão pelo ID
      const session = await this.sessionRepository.findBySessionId(sessionId);

      if (session) {
        // Atualiza a última resposta da IA e a data da última interação
        await this.sessionRepository.update(session._id.toString(), {
          lastAiResponse: lastAiResponse,
          lastInteraction: new Date(),
        });
        this.logger.debug(
          'Última resposta da IA e data de interação atualizadas com sucesso.',
        );
      } else {
        this.logger.warn(
          `Sessão não encontrada para sessionId: ${sessionId}. Não foi possível atualizar a última resposta da IA.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar a última resposta da IA para a sessão: ${sessionId}. Erro: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
