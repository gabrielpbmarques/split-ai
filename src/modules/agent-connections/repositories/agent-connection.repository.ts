import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AgentConnectionEntity } from 'src/infrastructure/database/schema/agent-connection.entity';

@Injectable()
export class AgentConnectionRepository {
  constructor(
    @InjectRepository(AgentConnectionEntity)
    private readonly repository: Repository<AgentConnectionEntity>,
  ) {}

  async create(
    data: Partial<AgentConnectionEntity>,
  ): Promise<AgentConnectionEntity> {
    const connection = this.repository.create(data);
    return this.repository.save(connection);
  }

  /**
   * All connections of a principal (enabled and disabled), with the child
   * agent eagerly loaded for the visual canvas. Ordered for stable rendering.
   */
  async findByPrincipalAgentId(
    principalAgentId: string,
  ): Promise<AgentConnectionEntity[]> {
    return this.repository.find({
      where: { principal_agent_id: principalAgentId },
      relations: ['childAgent'],
      order: { position: 'ASC', created_at: 'ASC' },
    });
  }

  /**
   * Only the enabled connections of a principal — the runtime path that turns
   * each connected child into a tool. Disabled connections never reach the LLM.
   */
  async findEnabledByPrincipalAgentId(
    principalAgentId: string,
  ): Promise<AgentConnectionEntity[]> {
    return this.repository.find({
      where: { principal_agent_id: principalAgentId, enabled: true },
      order: { position: 'ASC', created_at: 'ASC' },
    });
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<AgentConnectionEntity[]> {
    return this.repository.find({
      where: { organization_id: organizationId },
      order: { position: 'ASC', created_at: 'ASC' },
    });
  }

  async findByIdForOrganization(
    id: string,
    organizationId: string,
  ): Promise<AgentConnectionEntity | null> {
    return this.repository.findOne({
      where: { id, organization_id: organizationId },
    });
  }

  async findById(id: string): Promise<AgentConnectionEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async existsByPair(
    principalAgentId: string,
    childAgentId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        principal_agent_id: principalAgentId,
        child_agent_id: childAgentId,
      },
    });
    return count > 0;
  }

  async getRoleFlagsByOrganization(
    organizationId?: string,
  ): Promise<{ principalIds: Set<string>; childIds: Set<string> }> {
    const rows = await this.repository.find({
      where: organizationId ? { organization_id: organizationId } : undefined,
      select: ['principal_agent_id', 'child_agent_id'],
    });
    const principalIds = new Set<string>();
    const childIds = new Set<string>();
    for (const row of rows) {
      principalIds.add(row.principal_agent_id);
      childIds.add(row.child_agent_id);
    }
    return { principalIds, childIds };
  }

  async getRoleFlags(
    agentId: string,
  ): Promise<{ isPrincipal: boolean; isTool: boolean }> {
    const [asPrincipal, asChild] = await Promise.all([
      this.repository.count({ where: { principal_agent_id: agentId } }),
      this.repository.count({ where: { child_agent_id: agentId } }),
    ]);
    return { isPrincipal: asPrincipal > 0, isTool: asChild > 0 };
  }

  async update(
    id: string,
    data: Partial<AgentConnectionEntity>,
  ): Promise<void> {
    await this.repository.update(id, data);
  }

  async deleteById(id: string, organizationId: string): Promise<void> {
    await this.repository.delete({ id, organization_id: organizationId });
  }
}
