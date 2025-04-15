import { Injectable, Logger } from '@nestjs/common';
import { ProcessMessageDataDto } from './process-message-data.dto';
import { GenerateAiResponseService } from '../Common/generate-ai-response.service';
import { agents } from '../../../constants/chats/chats';

@Injectable()
export class ProcessMessageDataService {
  private readonly logger = new Logger(ProcessMessageDataService.name);
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
  ) {}

  async execute(processMessageDataDto: ProcessMessageDataDto): Promise<any> {
    this.logger.log(
      `Iniciando processamento de dados da mensagem para a sessão: ${processMessageDataDto.sessionId}`,
    );
    const {
      message,
      sessionId,
      agentId = 'message_data_parser',
      lastAiResponse,
    } = processMessageDataDto;

    // Tipando corretamente o agentId para corresponder às chaves válidas de agents
    const typedAgentId = 'message_data_parser' as keyof typeof agents;

    try {
      // Prepara a mensagem com contexto da última resposta da IA, se disponível
      let messageWithContext = message;

      // Se temos a última resposta da IA, adicionamos como contexto
      if (lastAiResponse) {
        messageWithContext = `[CONTEXTO: A última pergunta da IA foi: "${lastAiResponse}"] \n\nResposta do usuário: "${message}"`;
        this.logger.debug(
          'Contexto da última resposta da IA adicionado à mensagem.',
        );
      }

      // Utiliza o agente de IA para extrair dados estruturados da mensagem
      const parserAiResponse = await this.generateAiResponseService.execute(
        messageWithContext,
        sessionId,
        {
          agent_id: agentId,
        },
        typedAgentId,
      );

      this.logger.verbose(
        `Resposta bruta do agente de parsing: ${parserAiResponse}`,
      );

      const cleanedResponse = parserAiResponse
        .replace(/```json\s*/, '') // remove ```json e espaços
        .replace(/```$/, '') // remove a última ```
        .trim();

      const parsed = JSON.parse(cleanedResponse);
      this.logger.debug('Dados estruturados extraídos com sucesso.');
      return parsed;
    } catch (error) {
      this.logger.error(
        `Erro ao processar dados da mensagem para a sessão: ${processMessageDataDto.sessionId}. Erro: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
