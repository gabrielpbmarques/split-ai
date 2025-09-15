export class ProcessMessageDataDto {
  message: string;
  sessionId?: string;
  agentId?: string;
  promptVariables?: Record<string, any>; // Variáveis adicionais para o prompt
}
