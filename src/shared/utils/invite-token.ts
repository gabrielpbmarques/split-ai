import { createHash, randomBytes } from 'crypto';

export interface GeneratedInviteToken {
  token: string;

  hash: string;
}

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateInviteToken(): GeneratedInviteToken {
  const token = randomBytes(32).toString('hex');
  return { token, hash: hashInviteToken(token) };
}
