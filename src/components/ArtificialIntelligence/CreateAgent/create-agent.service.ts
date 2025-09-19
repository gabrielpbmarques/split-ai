import { Injectable } from '@nestjs/common';
import { AgentInstructionRepository } from 'src/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/repositories/agent.repository';

import { CreateAgentDto } from './create-agent.dto';

@Injectable()
export class CreateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
  ) {}

  async execute(dto: CreateAgentDto) {
    const agent = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? null,
      temperature: dto.temperature ?? 0.4,
      with_history: dto.withHistory ?? true,
      parser_schema: dto.parser?.schema ?? null,
      parser_name: dto.parser?.name ?? null,
      parser_description: dto.parser?.description ?? null,
    });

    await this.agentInstructionRepository.create({
      agent_id: agent.id,
      instructions: dto.instructions,
    });

    return { id: agent.id };
  }
}
