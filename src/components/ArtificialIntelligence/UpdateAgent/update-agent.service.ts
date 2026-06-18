import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentEntity } from 'src/entities';
import { AgentInstructionRepository, AgentRepository } from 'src/repositories';
import { User } from 'src/types';

import { UpdateAgentDto } from './update-agent.dto';

@Injectable()
export class UpdateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
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

  /**
   * Platform admins (global `role: 'admin'`) may access any agent; every other
   * user is restricted to agents within their own organization.
   */
  private authorizeAccess(agent: AgentEntity, user: User): void {
    if (user.role === 'admin') {
      return;
    }
    if (agent.organization_id !== user.organization_id) {
      throw new ForbiddenException('Você não tem acesso a este agente.');
    }
  }

  async update(idOrIdentifier: string, dto: UpdateAgentDto, user: User) {
    const agent = await this.resolveAgent(idOrIdentifier);
    if (!agent) throw new NotFoundException('Agente não encontrado.');

    this.authorizeAccess(agent, user);

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

    // Reassigning an agent to another organization stays platform-admin-only;
    // org members can never move an agent out of their own organization.
    if (user.role === 'admin') {
      const orgFromDtoRaw = (dto as any).organization_id ?? dto.organizationId;
      if (orgFromDtoRaw !== undefined) {
        const normalized =
          typeof orgFromDtoRaw === 'string' && orgFromDtoRaw.trim().length === 0
            ? null
            : orgFromDtoRaw;
        updateData.organization_id = normalized ?? null;
      }
    }

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

    return { id: agent.id };
  }

  async getOne(idOrIdentifier: string, user: User) {
    const agent = await this.resolveAgent(idOrIdentifier);
    if (!agent) throw new NotFoundException('Agente não encontrado.');

    this.authorizeAccess(agent, user);

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
      organization_id: (agent as any).organization_id ?? null,
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
