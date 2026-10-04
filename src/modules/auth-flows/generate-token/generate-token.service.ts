import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { UserEntity } from 'src/infrastructure/database/schema/user.entity';
import { UserTokenRepository } from 'src/modules/auth-flows/repositories/user-token.repository';
import { env } from 'src/shared/config/env';
import { UserRole } from 'src/shared/contracts';

@Injectable()
export class GenerateTokenService {
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  /**
   * Generates a JWT token for a user and stores it in the database
   * @param user The user entity to generate a token for
   * @returns The generated token and its expiration date
   */
  async execute(user: UserEntity): Promise<{ token: string; expiresAt: Date }> {
    const expirationHours = env.JWT_EXPIRATION_HOURS;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    let payload: any = {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    };

    if (user.role !== 'guest') {
      payload = {
        ...payload,
        organization_id: user.organization_id,
        org_role: user.org_role,
      };
    }

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
