import type { ApiKeyEntity } from 'src/infrastructure/database/schema/api-key.entity';

export type ApiKeyListItem = Pick<
  ApiKeyEntity,
  | 'id'
  | 'name'
  | 'key_prefix'
  | 'scopes'
  | 'last_used_at'
  | 'expires_at'
  | 'revoked_at'
  | 'created_at'
>;
