import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { Executor } from 'src/infrastructure/database/database.types';
import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import type { ResponseFormat } from 'src/shared/contracts';
import {
  type PageRequest,
  type PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';
import { isUuid } from 'src/shared/utils/is-uuid';

export interface AgentWithLatestInstructions {
  id: string;
  name: string;
  agent_identifier: string | null;
  model: string | null;
  temperature: number | null;
  with_history: boolean;
  tools: string[];
  sites: string[] | null;
  response_format: ResponseFormat | null;
  system_prompt: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class AgentRepository {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly repository: Repository<AgentEntity>,
  ) {}

  async create(
    data: Partial<AgentEntity>,
    tx?: Executor,
  ): Promise<AgentEntity> {
    const repo = this.repo(tx);
    return repo.save(repo.create(data));
  }

  async update(
    id: string,
    data: Partial<AgentEntity>,
    tx?: Executor,
  ): Promise<void> {
    await this.repo(tx).update(id, data as QueryDeepPartialEntity<AgentEntity>);
  }

  async findById(id: string): Promise<AgentEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdentifier(identifier: string): Promise<AgentEntity | null> {
    return this.repository.findOne({
      where: { agent_identifier: identifier },
    });
  }

  async findByIdOrIdentifier(
    idOrIdentifier: string,
  ): Promise<AgentEntity | null> {
    if (isUuid(idOrIdentifier)) {
      const byId = await this.findById(idOrIdentifier);
      if (byId) return byId;
    }
    return this.findByIdentifier(idOrIdentifier);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async listPaginated<TField extends keyof AgentEntity = keyof AgentEntity>(
    page: PageRequest,
    fields?: readonly TField[],
  ): Promise<PageResult<Pick<AgentEntity, TField>>> {
    const [items, total] = await this.repository.findAndCount({
      select: fields ? [...fields] : undefined,
      order: { created_at: 'DESC' },
      skip: skipOf(page),
      take: page.limit,
    });

    return { items: items as Pick<AgentEntity, TField>[], total };
  }

  async listWithLatestInstructionsPaginated(
    page: PageRequest,
  ): Promise<PageResult<AgentWithLatestInstructions>> {
    const query = this.repository
      .createQueryBuilder('a')
      .select([
        'a.id AS id',
        'a.name AS name',
        'a.agent_identifier AS agent_identifier',
        'a.model AS model',
        'a.temperature AS temperature',
        'a.with_history AS with_history',
        'a.tools AS tools',
        'a.sites AS sites',
        'a.response_format AS response_format',
        'a.system_prompt AS system_prompt',
        'a.created_at AS created_at',
        'a.updated_at AS updated_at',
      ])
      .orderBy('a.created_at', 'DESC')
      .offset(skipOf(page))
      .limit(page.limit);

    const [items, total] = await Promise.all([
      query.getRawMany<AgentWithLatestInstructions>(),
      this.repository.count(),
    ]);

    return { items, total };
  }

  private repo(tx?: Executor): Repository<AgentEntity> {
    return tx ? tx.getRepository(AgentEntity) : this.repository;
  }
}
