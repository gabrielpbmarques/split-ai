import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { CreateAgentConnectionDto } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.dto';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Injectable()
export class CreateAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly agentRepository: AgentRepository,
  ) {}

  async execute(dto: CreateAgentConnectionDto): Promise<{ id: string }> {
    if (dto.principalAgentId === dto.childAgentId) {
      throw new BadRequestException(
        'Um agente não pode se conectar a si mesmo.',
      );
    }

    const [principal, child] = await Promise.all([
      this.agentRepository.findById(dto.principalAgentId),
      this.agentRepository.findById(dto.childAgentId),
    ]);

    if (!principal) {
      throw new NotFoundException('Agente principal não encontrado.');
    }
    if (!child) {
      throw new NotFoundException('Agente conectado não encontrado.');
    }

    const duplicate = await this.agentConnectionRepository.existsByPair(
      dto.principalAgentId,
      dto.childAgentId,
    );
    if (duplicate) {
      throw new ConflictException('Esta conexão já existe.');
    }

    const reciprocal = await this.agentConnectionRepository.existsByPair(
      dto.childAgentId,
      dto.principalAgentId,
    );
    if (reciprocal) {
      throw new ConflictException(
        'Já existe uma conexão inversa entre estes agentes; conexões recíprocas não são permitidas.',
      );
    }

    const [childFlags, principalFlags] = await Promise.all([
      this.agentConnectionRepository.getRoleFlags(dto.childAgentId),
      this.agentConnectionRepository.getRoleFlags(dto.principalAgentId),
    ]);
    if (childFlags.hasTools) {
      throw new ConflictException(
        'O agente conectado tem ferramentas próprias e não pode ser usado como ferramenta.',
      );
    }
    if (principalFlags.isTool) {
      throw new ConflictException(
        'O agente já é ferramenta de outro agente e não pode ter ferramentas próprias.',
      );
    }

    const toolNameTaken = await this.agentConnectionRepository.existsToolName(
      dto.principalAgentId,
      dto.toolName,
    );
    if (toolNameTaken) {
      throw new ConflictException(
        'Já existe uma conexão com este toolName neste agente principal.',
      );
    }

    const connection = await this.agentConnectionRepository.create({
      principal_agent_id: dto.principalAgentId,
      child_agent_id: dto.childAgentId,
      tool_name: dto.toolName,
      tool_description: dto.toolDescription,
      enabled: dto.enabled ?? true,
      position: dto.position ?? 0,
    });

    return { id: connection.id };
  }
}
