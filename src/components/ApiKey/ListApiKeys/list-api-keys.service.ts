import { Injectable } from '@nestjs/common';
import { ApiKeyRepository } from 'src/repositories';
import { ApiKeyListItem } from 'src/types';

@Injectable()
export class ListApiKeysService {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(organizationId: string): Promise<ApiKeyListItem[]> {
    const apiKeys =
      await this.apiKeyRepository.listByOrganization(organizationId);

    return apiKeys.map((apiKey) => ({
      id: apiKey.id,
      name: apiKey.name,
      key_prefix: apiKey.key_prefix,
      scopes: apiKey.scopes,
      last_used_at: apiKey.last_used_at,
      expires_at: apiKey.expires_at,
      revoked_at: apiKey.revoked_at,
      created_at: apiKey.created_at,
    }));
  }
}
