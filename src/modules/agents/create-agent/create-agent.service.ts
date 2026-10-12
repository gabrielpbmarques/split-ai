import { BadRequestException, Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import type { CreateAgentDto } from 'src/modules/agents/create-agent/create-agent.dto';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { AVAILABLE_TOOL_IDS } from 'src/modules/retrieval/tools-catalog';

@Injectable()
export class CreateAgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    dto: CreateAgentDto,
    user: AuthenticatedUser,
  ): Promise<{ id: string }> {
    if (dto.tools) {
      for (const toolId of dto.tools) {
        if (!AVAILABLE_TOOL_IDS.includes(toolId)) {
          throw new BadRequestException(`Ferramenta desconhecida: ${toolId}`);
        }
      }
    }

    const created = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? 'deepseek-chat-v3.2',
      temperature: dto.temperature ?? 0.4,
      with_history: dto.withHistory ?? true,
      tools: dto.tools ?? ['vector_search'],
      system_prompt: dto.systemPrompt,
      response_format: dto.responseFormat ?? null,
      user_id: user.id,
    });

    return { id: created.id };
  }
}
