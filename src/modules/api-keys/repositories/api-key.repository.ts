import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Or, Repository } from 'typeorm';

import { ApiKeyEntity } from 'src/infrastructure/database/schema/api-key.entity';
import {
  PageRequest,
  PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ApiKeyRepository {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
  ) {}

  async create(data: Partial<ApiKeyEntity>): Promise<ApiKeyEntity> {
    const apiKey = this.apiKeyRepository.create(data);
    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Resolves an API key by its secret hash, returning it only when it is still
   * usable (not revoked and not past its expiration).
   */
  async findValidByHash(keyHash: string): Promise<ApiKeyEntity | null> {
    return this.apiKeyRepository.findOne({
      where: {
        key_hash: keyHash,
        revoked_at: IsNull(),
        expires_at: Or(IsNull(), MoreThan(new Date())),
      },
    });
  }

  async listByOrganizationPaginated<
    TField extends keyof ApiKeyEntity = keyof ApiKeyEntity,
  >(
    organizationId: string,
    page: PageRequest,
    fields?: readonly TField[],
  ): Promise<PageResult<Pick<ApiKeyEntity, TField>>> {
    const [items, total] = await this.apiKeyRepository.findAndCount({
      where: { organization_id: organizationId },
      select: fields ? [...fields] : undefined,
      order: { created_at: 'DESC' },
      skip: skipOf(page),
      take: page.limit,
    });

    return { items: items as Pick<ApiKeyEntity, TField>[], total };
  }

  async findByIdForOrganization(
    id: string,
    organizationId: string,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyRepository.findOne({
      where: { id, organization_id: organizationId },
    });
  }

  async revoke(id: string): Promise<void> {
    await this.apiKeyRepository.update(id, { revoked_at: new Date() });
  }

  async touchLastUsed(id: string): Promise<void> {
    await this.apiKeyRepository.update(id, { last_used_at: new Date() });
  }
}
