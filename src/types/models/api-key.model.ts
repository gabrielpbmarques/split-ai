import { ApiKeyEntity } from 'src/entities/api-key.entity';

// Safe, non-sensitive view of an API key (never exposes the secret/hash).
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
