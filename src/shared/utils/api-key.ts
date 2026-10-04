import { createHash, randomBytes } from 'crypto';

const API_KEY_PREFIX = 'sk_live_';
const PREFIX_DISPLAY_LENGTH = API_KEY_PREFIX.length + 6;

export interface GeneratedApiKey {
  secret: string;

  prefix: string;

  hash: string;
}

export function hashApiKey(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function generateApiKey(): GeneratedApiKey {
  const secret = `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
  return {
    secret,
    prefix: `${secret.slice(0, PREFIX_DISPLAY_LENGTH)}…`,
    hash: hashApiKey(secret),
  };
}
