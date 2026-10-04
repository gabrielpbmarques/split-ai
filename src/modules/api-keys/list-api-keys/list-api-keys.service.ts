import { Injectable } from '@nestjs/common';

import type { ListApiKeysDto } from 'src/modules/api-keys/list-api-keys/list-api-keys.dto';
import { ApiKeyRepository } from 'src/modules/api-keys/repositories/api-key.repository';
import type { ApiKeyListItem } from 'src/shared/contracts';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

const API_KEY_FIELDS = [
  'id',
  'name',
  'key_prefix',
  'scopes',
  'last_used_at',
  'expires_at',
  'revoked_at',
  'created_at',
] as const satisfies readonly (keyof ApiKeyListItem)[];

@Injectable()
export class ListApiKeysService {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(
    organizationId: string,
    dto: ListApiKeysDto,
  ): Promise<PaginatedResponse<ApiKeyListItem>> {
    const page = await this.apiKeyRepository.listByOrganizationPaginated(
      organizationId,
      dto,
      API_KEY_FIELDS,
    );
    return toPaginatedResponse(page, dto);
  }
}
