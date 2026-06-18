import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentConnectionEntity } from 'src/entities';
import { AgentConnectionRepository } from 'src/repositories';

import { UpdateAgentConnectionDto } from './update-agent-connection.dto';

@Injectable()
export class UpdateAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(
    dto: UpdateAgentConnectionDto,
    organizationId: string,
  ): Promise<{ success: true }> {
    const connection =
      await this.agentConnectionRepository.findByIdForOrganization(
        dto.id,
        organizationId,
      );
    if (!connection) {
      throw new NotFoundException('Conexão não encontrada.');
    }

    if (dto.toolName && dto.toolName !== connection.tool_name) {
      const siblings =
        await this.agentConnectionRepository.findByPrincipalAgentId(
          connection.principal_agent_id,
        );
      if (
        siblings.some(
          (sibling) =>
            sibling.id !== connection.id && sibling.tool_name === dto.toolName,
        )
      ) {
        throw new ConflictException(
          'Já existe uma conexão com este toolName neste agente principal.',
        );
      }
    }

    const patch: Partial<AgentConnectionEntity> = {};
    if (dto.toolName !== undefined) patch.tool_name = dto.toolName;
    if (dto.toolDescription !== undefined)
      patch.tool_description = dto.toolDescription;
    if (dto.enabled !== undefined) patch.enabled = dto.enabled;
    if (dto.position !== undefined) patch.position = dto.position;

    await this.agentConnectionRepository.update(connection.id, patch);

    return { success: true };
  }
}
