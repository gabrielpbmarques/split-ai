import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { InvokeConnectedAgentService } from 'src/modules/agent-runtime/invoke-connection-agent/invoke-connected-agent.service';
import type { AgentTool } from 'src/shared/contracts';

const MAX_AGENT_CONNECTION_DEPTH = 1;

@Injectable()
export class AppendConnectionToolsService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly invokeConnectedAgentService: InvokeConnectedAgentService,
  ) {}

  async execute(
    dbAgent: AgentEntity,
    tools: AgentTool[],
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
          func: async ({ input }: { input: string }) => {
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
