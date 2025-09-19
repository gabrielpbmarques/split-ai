import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/user.entity';
import { UserTokenRepository } from 'src/repositories/user-token.repository';
import { UserRole } from 'src/types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GenerateTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userTokenRepository: UserTokenRepository,
  ) {}

  /**
   * Generates a JWT token for a user and stores it in the database
   * @param user The user entity to generate a token for
   * @returns The generated token and its expiration date
   */
  async execute(
    user: UserEntity,
    deviceFingerprint?: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    // Define token expiration time (default: 24 hours)
    const expirationHours = this.configService.get<number>(
      'JWT_EXPIRATION_HOURS',
      24,
    );
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Create payload for JWT
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      jti: uuidv4(), // JWT ID - unique identifier for this token
      iat: Math.floor(Date.now() / 1000), // Issued at time
      device_fingerprint: deviceFingerprint,
    };

    // Generate JWT token
    const token = this.jwtService.sign(payload, {
      expiresIn: `${expirationHours}h`,
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    // Store token in database (invalidating previous tokens)
    const roleToPersist: UserRole =
      user.role === 'establishment' ? 'citizen' : user.role;

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

  /**
   * Validates a JWT token
   * @param token The token to validate
   * @returns The decoded token payload if valid
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }
}
