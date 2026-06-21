import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentConnectionRepository, AgentRepository } from 'src/repositories';

import { CreateAgentConnectionDto } from './create-agent-connection.dto';

@Injectable()
export class CreateAgentConnectionService {
  constructor(
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly agentRepository: AgentRepository,
  ) {}

  async execute(
    dto: CreateAgentConnectionDto,
    organizationId: string,
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

    if (
      principal.organization_id !== organizationId ||
      child.organization_id !== organizationId
    ) {
      throw new ForbiddenException('Agente não pertence à sua organização.');
    }

    const duplicate = await this.agentConnectionRepository.existsByPair(
      dto.principalAgentId,
      dto.childAgentId,
    );
    if (duplicate) {
      throw new ConflictException('Esta conexão já existe.');
    }

    // Reciprocal guard: A→B blocks B→A up front. Deeper/indirect cycles are
    // bounded authoritatively at runtime by ResolveAgent's max-depth guard.
    const reciprocal = await this.agentConnectionRepository.existsByPair(
      dto.childAgentId,
      dto.principalAgentId,
    );
    if (reciprocal) {
      throw new ConflictException(
        'Já existe uma conexão inversa entre estes agentes; conexões recíprocas não são permitidas.',
      );
    }

    // Strict 2-tier disjoint roles: an agent is a principal, a tool, or
    // standalone — never both. A child that is already a principal (has its own
    // tools) can't be demoted to a tool, and a principal that is already wired
    // in as someone else's tool can't gain tools of its own. (Existence-based,
    // matching the derived is_tool/is_principal flags.)
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

    // Tool names must be unique within a principal's toolset so the LLM never
    // sees two tools with the same name.
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
      organization_id: organizationId,
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
