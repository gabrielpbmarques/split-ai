export class ProcessMessageDataDto {
  message: string;
  sessionId?: string;
  agentId?: string;
  lastAiResponse?: string; // Última resposta da IA conversacional
  worker?: any; // Dados do worker para contexto
}
