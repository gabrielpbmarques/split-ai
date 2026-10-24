import { Injectable, NotFoundException } from '@nestjs/common';

import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import type { ResponseFormat } from 'src/shared/contracts';

export interface AgentDetails {
  id: string;
  name: string;
  agentIdentifier: string | null;
  model: string | null;
  temperature: number | null;
  withHistory: boolean;
  tools: string[];
  sites: string[] | null;
  responseFormat: ResponseFormat | null;
  systemPrompt: string;
  isTool: boolean;
  isPrincipal: boolean;
  hasTools: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(idOrIdentifier: string): Promise<AgentDetails> {
    const agent =
      await this.agentRepository.findByIdOrIdentifier(idOrIdentifier);

    if (!agent) {
      throw new NotFoundException('Agente não encontrado.');
    }

    const flags = await this.agentConnectionRepository.getRoleFlags(agent.id);

    return {
      id: agent.id,
      name: agent.name,
      agentIdentifier: agent.agent_identifier,
      model: agent.model,
      temperature: agent.temperature,
      withHistory: agent.with_history,
      tools: agent.tools ?? [],
      sites: agent.sites ?? null,
      responseFormat: agent.response_format ?? null,
      systemPrompt: agent.system_prompt,
      isTool: flags.isTool,
      isPrincipal: !flags.isTool,
      hasTools: flags.hasTools,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
    };
  }
}
