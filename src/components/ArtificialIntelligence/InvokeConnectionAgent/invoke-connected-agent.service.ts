import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { HumanMessage } from 'langchain';
import { config } from 'src/config';
import { AgentFinalResponseSchema } from 'src/types';

import { ResolveAgentService } from '../ResolveAgent/resolve-agent.service';

@Injectable()
export class InvokeConnectedAgentService {
  constructor(
    @Inject(forwardRef(() => ResolveAgentService))
    private readonly resolveAgentService: ResolveAgentService,
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
          tags: [config.env, childAgent.id, childAgent.organization_id],
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
