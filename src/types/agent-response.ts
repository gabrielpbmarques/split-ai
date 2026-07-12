import { z } from 'zod';

export const AgentFinalResponseSchema = z.object({
  finalAnswer: z.string().describe('Resposta final e completa para o usuário'),
  confidence: z.number().min(0).max(1).optional().catch(undefined),
  needsClarification: z.boolean().optional().catch(undefined),
  sources: z.array(z.string()).optional().catch(undefined),
  toolCallsUsed: z.array(z.string()).optional().catch(undefined),
});

export type AgentFinalResponse = z.infer<typeof AgentFinalResponseSchema>;
