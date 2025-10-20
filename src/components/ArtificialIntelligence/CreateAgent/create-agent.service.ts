import { Injectable } from '@nestjs/common';
import { AgentInstructionRepository, AgentRepository } from 'src/repositories';
import { User } from 'src/types';

import { LoadAgentSitesService } from '../LoadAgentSites/load-agent-sites.service';

import { CreateAgentDto } from './create-agent.dto';

@Injectable()
export class CreateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly loadAgentSitesService: LoadAgentSitesService,
  ) {}

  async execute(dto: CreateAgentDto, user: User) {
    const agent = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? 'gemini-2.5-flash',
      temperature: dto.temperature ?? 0.4,
      with_history: dto.withHistory ?? true,
      sites: dto.sites && dto.sites.length ? dto.sites : null,
      parser_schema: dto.parser?.schema ?? null,
      parser_name: dto.parser?.name ?? null,
      parser_description: dto.parser?.description ?? null,
      organization_id: user.role === 'admin' ? null : user.organization_id,
      user_id: user.id,
    });

    await this.agentInstructionRepository.create({
      agent_id: agent.id,
      instructions: dto.instructions,
    });

    if (dto.sites?.length) {
      await this.loadAgentSitesService.execute(dto.sites, agent.id);
    }

    return { id: agent.id };
  }
}
