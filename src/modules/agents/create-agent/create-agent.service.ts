import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import type { CreateAgentDto } from 'src/modules/agents/create-agent/create-agent.dto';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Injectable()
export class CreateAgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    dto: CreateAgentDto,
    user: AuthenticatedUser,
  ): Promise<{ id: string }> {
    const created = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? 'deepseek-chat-v3.2',
      temperature: dto.temperature ?? 0.4,
      with_history: dto.withHistory ?? true,
      vector_search_tool: dto.vectorSearchTool ?? true,
      system_prompt: dto.systemPrompt,
      response_format: dto.responseFormat ?? null,
      user_id: user.id,
    });

    return { id: created.id };
  }
}
