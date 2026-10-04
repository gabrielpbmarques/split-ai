import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Or, Repository } from 'typeorm';

import { ApiKeyEntity } from 'src/infrastructure/database/schema/api-key.entity';

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

  async listByOrganization(organizationId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
    });
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
