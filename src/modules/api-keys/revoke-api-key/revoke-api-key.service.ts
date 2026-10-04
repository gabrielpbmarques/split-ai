import { Injectable, NotFoundException } from '@nestjs/common';

import { ApiKeyRepository } from 'src/modules/api-keys/repositories/api-key.repository';
import type { RevokeApiKeyDto } from 'src/modules/api-keys/revoke-api-key/revoke-api-key.dto';

@Injectable()
export class RevokeApiKeyService {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(
    dto: RevokeApiKeyDto,
    organizationId: string,
  ): Promise<{ id: string; revoked: true }> {
    const apiKey = await this.apiKeyRepository.findByIdForOrganization(
      dto.id,
      organizationId,
    );

    if (!apiKey) {
      throw new NotFoundException('Chave de API não encontrada');
    }

    if (!apiKey.revoked_at) {
      await this.apiKeyRepository.revoke(apiKey.id);
    }

    return { id: apiKey.id, revoked: true };
  }
}
