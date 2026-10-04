import { createHash, randomBytes } from 'crypto';

export interface GeneratedInviteToken {
  // Raw token sent to the invitee (in the invite link).
  token: string;
  // SHA-256 hex digest persisted on the user record.
  hash: string;
}

/** SHA-256 hex digest of an invite token. */
export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Generates a one-time invite token along with its hash. */
export function generateInviteToken(): GeneratedInviteToken {
  const token = randomBytes(32).toString('hex');
  return { token, hash: hashInviteToken(token) };
}
