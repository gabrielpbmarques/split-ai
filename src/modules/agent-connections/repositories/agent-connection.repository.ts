import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AgentConnectionEntity } from 'src/infrastructure/database/schema/agent-connection.entity';

export interface AgentConnectionView {
  id: string;
  childAgentId: string;
  childAgentName: string | null;
  childAgentIdentifier: string | null;
  toolName: string;
  toolDescription: string;
  enabled: boolean;
  position: number;
}

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

  async existsToolName(
    principalAgentId: string,
    toolName: string,
    excludeId?: string,
  ): Promise<boolean> {
    const qb = this.repository
      .createQueryBuilder('c')
      .where('c.principal_agent_id = :principalAgentId', { principalAgentId })
      .andWhere('c.tool_name = :toolName', { toolName });
    if (excludeId) qb.andWhere('c.id != :excludeId', { excludeId });
    return (await qb.getCount()) > 0;
  }

  async listViewsByPrincipalAgentId(
    principalAgentId: string,
  ): Promise<AgentConnectionView[]> {
    return this.repository
      .createQueryBuilder('c')
      .leftJoin('c.childAgent', 'child')
      .select([
        'c.id AS "id"',
        'c.child_agent_id AS "childAgentId"',
        'child.name AS "childAgentName"',
        'child.agent_identifier AS "childAgentIdentifier"',
        'c.tool_name AS "toolName"',
        'c.tool_description AS "toolDescription"',
        'c.enabled AS "enabled"',
        'c.position AS "position"',
      ])
      .where('c.principal_agent_id = :principalAgentId', { principalAgentId })
      .orderBy('c.position', 'ASC')
      .addOrderBy('c.created_at', 'ASC')
      .getRawMany<AgentConnectionView>();
  }
  async findEnabledByPrincipalAgentId(
    principalAgentId: string,
  ): Promise<AgentConnectionEntity[]> {
    return this.repository.find({
      where: { principal_agent_id: principalAgentId, enabled: true },
      order: { position: 'ASC', created_at: 'ASC' },
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

  async getAllRoleFlags(): Promise<{
    principalIds: Set<string>;
    childIds: Set<string>;
  }> {
    const rows = await this.repository.find({
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
    await this.repository.update(
      id,
      data as QueryDeepPartialEntity<AgentConnectionEntity>,
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
