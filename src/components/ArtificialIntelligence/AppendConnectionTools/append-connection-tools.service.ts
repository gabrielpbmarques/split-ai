import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { AgentEntity } from 'src/entities';
import { AgentConnectionRepository } from 'src/repositories';
import { z } from 'zod';

import { InvokeConnectedAgentService } from '../InvokeConnectionAgent/invoke-connected-agent.service';

const MAX_AGENT_CONNECTION_DEPTH = 1;

@Injectable()
export class AppendConnectionToolsService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    @Inject(forwardRef(() => InvokeConnectedAgentService))
    private readonly invokeConnectedAgentService: InvokeConnectedAgentService,
  ) {}

  async execute(
    dbAgent: AgentEntity,
    tools: DynamicStructuredTool<z.ZodObject<any>>[],
    connectionContext?: { depth: number; visited: string[] },
    scopeCompanyId?: string,
  ): Promise<void> {
    const depth = connectionContext?.depth ?? 0;
    const visited = connectionContext?.visited ?? [dbAgent.id];

    if (depth >= MAX_AGENT_CONNECTION_DEPTH) {
      return;
    }

    const connections =
      await this.agentConnectionRepository.findEnabledByPrincipalAgentId(
        dbAgent.id,
      );

    for (const connection of connections) {
      tools.push(
        new DynamicStructuredTool({
          name: connection.tool_name,
          description: connection.tool_description,
          schema: z.object({
            input: z
              .string()
              .describe('Pergunta ou tarefa a delegar ao agente conectado.'),
          }),
          func: async ({ input }) => {
            if (visited.includes(connection.child_agent_id)) {
              return 'Conexão circular detectada; chamada ignorada.';
            }
            return this.invokeConnectedAgentService.execute(
              connection.child_agent_id,
              input,
              {
                depth: depth + 1,
                visited: [...visited, connection.child_agent_id],
              },
              scopeCompanyId,
            );
          },
        }),
      );
    }
  }
}
