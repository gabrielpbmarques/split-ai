import { z } from 'zod';

export const AgentFinalResponseSchema = z.object({
  finalAnswer: z.string().describe('Resposta final e completa para o usuário'),
  confidence: z.number().min(0).max(1).optional(),
  needsClarification: z.boolean().optional(),
  sources: z.array(z.string()).optional(),
  toolCallsUsed: z.array(z.string()).optional(),
});

export type AgentFinalResponse = z.infer<typeof AgentFinalResponseSchema>;
