import { Injectable } from '@nestjs/common';
import { AgentInstructionRepository, AgentRepository } from 'src/repositories';

import { LoadAgentSitesService } from '../LoadAgentSites/load-agent-sites.service';

import { UpdateAgentDto } from './update-agent.dto';

@Injectable()
export class UpdateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly loadAgentSitesService: LoadAgentSitesService,
  ) {}

  private isUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  private async resolveAgent(idOrIdentifier: string) {
    if (this.isUuid(idOrIdentifier)) {
      const byId = await this.agentRepository.findById(idOrIdentifier);
      if (byId) return byId;
    }
    return await this.agentRepository.findByIdentifier(idOrIdentifier);
  }

  async update(idOrIdentifier: string, dto: UpdateAgentDto) {
    const agent = await this.resolveAgent(idOrIdentifier);
    if (!agent) throw new Error('Agent não encontrado');

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.agentIdentifier !== undefined)
      updateData.agent_identifier = dto.agentIdentifier;
    if (dto.model !== undefined) updateData.model = dto.model;
    if (dto.temperature !== undefined) updateData.temperature = dto.temperature;
    if (dto.withHistory !== undefined)
      updateData.with_history = dto.withHistory;
    if (dto.sites !== undefined)
      updateData.sites = dto.sites && dto.sites.length ? dto.sites : null;

    if (dto.parser !== undefined) {
      if (dto.parser === null) {
        updateData.parser_name = null;
        updateData.parser_description = null;
        updateData.parser_schema = null;
      } else {
        updateData.parser_name = dto.parser.name;
        updateData.parser_description = dto.parser.description;
        updateData.parser_schema = dto.parser.schema;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.agentRepository.update(agent.id, updateData);
    }

    if (dto.instructions !== undefined) {
      await this.agentInstructionRepository.updateLatestByAgentId(
        agent.id,
        dto.instructions,
      );
    }

    if (dto.sites !== undefined) {
      await this.loadAgentSitesService.execute(dto.sites, agent.id);
    }

    return { id: agent.id };
  }

  async getOne(idOrIdentifier: string) {
    const agent = await this.resolveAgent(idOrIdentifier);
    if (!agent) throw new Error('Agent não encontrado');

    const latest = await this.agentInstructionRepository.findLatestByAgentId(
      agent.id,
    );

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
  }

  async list() {
    const agents = await this.agentRepository.find({
      order: { created_at: 'DESC' },
    });
    const result = await Promise.all(
      agents.map(async (a) => {
        const latest =
          await this.agentInstructionRepository.findLatestByAgentId(a.id);
        return {
          id: a.id,
          name: a.name,
          agentIdentifier: a.agent_identifier,
          model: a.model,
          temperature: a.temperature,
          withHistory: a.with_history,
          sites: (a as any).sites ?? null,
          parser: a.parser_schema
            ? {
                name: a.parser_name,
                description: a.parser_description,
                schema: a.parser_schema,
              }
            : null,
          instructions: latest?.instructions || null,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        };
      }),
    );
    return result;
  }
}
