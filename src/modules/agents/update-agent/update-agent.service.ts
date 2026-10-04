import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { UpdateAgentDto } from 'src/modules/agents/update-agent/update-agent.dto';
import { isUuid } from 'src/shared/utils/is-uuid';
@Injectable()
export class UpdateAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    idOrIdentifier: string,
    dto: UpdateAgentDto,
    user: AuthenticatedUser,
  ): Promise<{ id: string }> {
    const agent = await this.resolveAgent(idOrIdentifier);
    if (!agent) throw new NotFoundException('Agente não encontrado.');

    this.accessScope.ensureCan(
      user,
      'agent.write',
      { organizationId: agent.organization_id },
      'Você não tem acesso a este agente.',
    );

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.agentIdentifier !== undefined)
      updateData.agent_identifier = dto.agentIdentifier;
    if (dto.model !== undefined) updateData.model = dto.model;
    if (dto.temperature !== undefined) updateData.temperature = dto.temperature;
    if (dto.withHistory !== undefined)
      updateData.with_history = dto.withHistory;
    if (dto.databaseTool !== undefined)
      updateData.database_tool = dto.databaseTool;
    if (dto.vectorSearchTool !== undefined)
      updateData.vector_search_tool = dto.vectorSearchTool;
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

  private async resolveAgent(
    idOrIdentifier: string,
  ): Promise<AgentEntity | null> {
    if (isUuid(idOrIdentifier)) {
      const byId = await this.agentRepository.findById(idOrIdentifier);
      if (byId) return byId;
    }
    return this.agentRepository.findByIdentifier(idOrIdentifier);
  }
}
