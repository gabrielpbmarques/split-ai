import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AgentConnectionEntity } from 'src/infrastructure/database/schema';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import type { UpdateAgentConnectionDto } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.dto';

@Injectable()
export class UpdateAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
  ) {}

  async execute(dto: UpdateAgentConnectionDto): Promise<{ success: true }> {
    const connection = await this.agentConnectionRepository.findById(dto.id);
    if (!connection) {
      throw new NotFoundException('Conexão não encontrada.');
    }

    if (dto.toolName && dto.toolName !== connection.tool_name) {
      const toolNameTaken = await this.agentConnectionRepository.existsToolName(
        connection.principal_agent_id,
        dto.toolName,
        connection.id,
      );
      if (toolNameTaken) {
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
