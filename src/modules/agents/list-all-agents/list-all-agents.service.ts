import { Injectable } from '@nestjs/common';

import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { AIInstructions } from 'src/shared/contracts';

export interface AgentListItem {
  id: string;
  name: string;
  agentIdentifier: string | null;
  model: string | null;
  temperature: number | null;
  withHistory: boolean;
  sites: string[] | null;
  parser: { name: string; description: string; schema: unknown } | null;
  instructions: AIInstructions | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ListAllAgentsService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
  ) {}

  async execute(): Promise<AgentListItem[]> {
    const agents = await this.agentRepository.find({
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      agents.map(async (agent) => {
        const latest =
          await this.agentInstructionRepository.findLatestByAgentId(agent.id);

        return {
          id: agent.id,
          name: agent.name,
          agentIdentifier: agent.agent_identifier,
          model: agent.model,
          temperature: agent.temperature,
          withHistory: agent.with_history,
          sites: (agent as any).sites ?? null,
          parser: agent.parser_schema
            ? {
                name: agent.parser_name,
                description: agent.parser_description,
                schema: agent.parser_schema,
              }
            : null,
          instructions: latest?.instructions || null,
          createdAt: agent.created_at,
          updatedAt: agent.updated_at,
        };
      }),
    );
  }
}
