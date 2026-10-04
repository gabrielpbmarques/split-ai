import { Inject, Injectable } from '@nestjs/common';
import { HumanMessage } from 'langchain';

import {
  AGENT_RESOLVER,
  AgentResolver,
} from 'src/modules/agent-runtime/contracts/agent-resolver.port';
import { env } from 'src/shared/config/env';
import { AgentFinalResponseSchema } from 'src/shared/contracts';

@Injectable()
export class InvokeConnectedAgentService {
  constructor(
    @Inject(AGENT_RESOLVER)
    private readonly resolveAgentService: AgentResolver,
  ) {}

  async execute(
    childAgentId: string,
    input: string,
    connectionContext: { depth: number; visited: string[] },
    scopeCompanyId?: string,
  ): Promise<string> {
    try {
      const childAgent = await this.resolveAgentService.execute(
        childAgentId,
        scopeCompanyId ? { companyId: scopeCompanyId } : undefined,
        undefined,
        connectionContext,
      );

      const result = await childAgent.runnable.invoke(
        { messages: [new HumanMessage(input)] } as any,
        {
          configurable: { thread_id: `conn_${childAgent.id}` },
          tags: [env.NODE_ENV, childAgent.id, childAgent.organization_id],
        },
      );

      const parsed = AgentFinalResponseSchema.safeParse(
        (result as any)?.structuredResponse,
      );
      if (parsed.success) {
        return parsed.data.finalAnswer;
      }

      return (
        (result as any)?.structuredResponse?.finalAnswer ??
        'O agente conectado não retornou uma resposta.'
      );
    } catch {
      return 'O agente conectado não está disponível no momento.';
    }
  }
}
