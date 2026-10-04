import { createHash, randomBytes } from 'crypto';

const API_KEY_PREFIX = 'sk_live_';
const PREFIX_DISPLAY_LENGTH = API_KEY_PREFIX.length + 6;

export interface GeneratedApiKey {
  // Full secret, returned to the caller exactly once.
  secret: string;
  // Stored, non-sensitive prefix used in listings (e.g. `sk_live_ab12cd…`).
  prefix: string;
  // SHA-256 hex digest persisted in place of the secret.
  hash: string;
}

/** SHA-256 hex digest of an API key secret. */
export function hashApiKey(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

/** Generates a new opaque API key secret along with its prefix and hash. */
export function generateApiKey(): GeneratedApiKey {
  const secret = `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
  return {
    secret,
    prefix: `${secret.slice(0, PREFIX_DISPLAY_LENGTH)}…`,
    hash: hashApiKey(secret),
  };
}
