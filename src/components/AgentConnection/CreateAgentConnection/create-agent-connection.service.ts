import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AgentConnectionRepository, AgentRepository } from 'src/repositories';

import { CreateAgentConnectionDto } from './create-agent-connection.dto';

@Injectable()
export class CreateAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly agentRepository: AgentRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    dto: CreateAgentConnectionDto,
    user: AuthenticatedUser,
  ): Promise<{ id: string }> {
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

    const scopeMessage = 'Agente não pertence à sua organização.';
    this.accessScope.ensureCan(
      user,
      'agent-connection.manage',
      { organizationId: principal.organization_id },
      scopeMessage,
    );
    this.accessScope.ensureCan(
      user,
      'agent-connection.manage',
      { organizationId: child.organization_id },
      scopeMessage,
    );

    if (principal.organization_id !== child.organization_id) {
      throw new ForbiddenException(
        'Os agentes pertencem a organizações diferentes.',
      );
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
    if (childFlags.isPrincipal) {
      throw new ConflictException(
        'O agente conectado já é um agente principal (possui ferramentas próprias) e não pode ser usado como ferramenta.',
      );
    }
    if (principalFlags.isTool) {
      throw new ConflictException(
        'O agente principal já está conectado como ferramenta de outro agente e não pode ter ferramentas próprias.',
      );
    }

    const siblings =
      await this.agentConnectionRepository.findByPrincipalAgentId(
        dto.principalAgentId,
      );
    if (siblings.some((connection) => connection.tool_name === dto.toolName)) {
      throw new ConflictException(
        'Já existe uma conexão com este toolName neste agente principal.',
      );
    }

    const connection = await this.agentConnectionRepository.create({
      organization_id: principal.organization_id,
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
