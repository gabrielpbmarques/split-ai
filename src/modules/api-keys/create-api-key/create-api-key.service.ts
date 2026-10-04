import { Injectable } from '@nestjs/common';

import { CreateApiKeyDto } from 'src/modules/api-keys/create-api-key/create-api-key.dto';
import { ApiKeyRepository } from 'src/modules/api-keys/repositories/api-key.repository';
import { generateApiKey } from 'src/shared/utils/api-key';

interface CreateApiKeyResult {
  id: string;
  name: string;
  key_prefix: string;
  // Full secret — returned only here, never retrievable again.
  secret: string;
  expires_at: Date | null;
}

@Injectable()
export class CreateApiKeyService {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(
    dto: CreateApiKeyDto,
    organizationId: string,
    userId: string | null,
  ): Promise<CreateApiKeyResult> {
    const { secret, prefix, hash } = generateApiKey();

    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await this.apiKeyRepository.create({
      organization_id: organizationId,
      name: dto.name,
      key_prefix: prefix,
      key_hash: hash,
      scopes: dto.scopes ?? null,
      expires_at: expiresAt,
      created_by: userId,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key_prefix: apiKey.key_prefix,
      secret,
      expires_at: apiKey.expires_at,
    };
  }
}
