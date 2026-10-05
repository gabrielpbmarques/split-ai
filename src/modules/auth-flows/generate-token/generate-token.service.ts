import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import type { UserEntity } from 'src/infrastructure/database/schema/user.entity';
import { UserTokenRepository } from 'src/modules/auth-flows/repositories/user-token.repository';
import { env } from 'src/shared/config/env';
import type { UserRole } from 'src/shared/contracts';

@Injectable()
export class GenerateTokenService {
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  async execute(user: UserEntity): Promise<{ token: string; expiresAt: Date }> {
    const expirationHours = env.JWT_EXPIRATION_HOURS;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const payload: Record<string, unknown> = {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    };

    const token = sign(payload, env.JWT_SECRET, {
      expiresIn: `${expirationHours}h`,
    });

    const roleToPersist: UserRole = user.role;

    await this.userTokenRepository.createUniqueToken({
      user_id: user.id,
      token,
      role: roleToPersist,
      status: 'active',
      expires_at: expiresAt,
    });

    return {
      token,
      expiresAt,
    };
  }
}
