import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserType } from '../../../decorators/roles.decorator';
import { Token } from 'src/models/Token.model';
import { TokenRepository } from 'src/repositories/Token.repository';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { CreateTokenDTO } from './CreateToken.dto';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { config } from 'src/config';
import { ObjectId } from 'mongoose';
import { CheckActiveTokenService } from '../CheckActiveToken/CheckActiveToken.service';

@Injectable()
export class CreateTokenService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly calculateCheckDigitService: CalculateCheckDigitService,
    private readonly checkActiveTokenService: CheckActiveTokenService,
  ) {}

  async execute(
    payload: CreateTokenDTO,
    userType?: UserType,
    userId?: string,
  ): Promise<Pick<Token, 'token' | 'expiresAt'>> {
    if (userType !== 'admin') {
      const hasAccess =
        await this.activityRepository.checkEstablishmentTokenAccess(
          payload.activityId,
        );

      if (!hasAccess) {
        throw new UnauthorizedException(
          'Establishment does not have token generation access',
        );
      }
    }

    const activeToken = await this.checkActiveTokenService.execute(
      payload.activityId,
      payload.type,
    );

    if (activeToken) return activeToken;

    const baseToken = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    const checkDigit = this.calculateCheckDigitService.execute(baseToken);

    const expiresAt =
      payload.expiresAt ||
      new Date(new Date().getTime() + config.tokenExpirationTime);

    const newToken: Omit<Token, '_id' | 'createdAt' | 'updatedAt'> = {
      token: `${baseToken}${checkDigit}`,
      expiresAt,
      activityId: payload.activityId as unknown as ObjectId,
      workerId: payload.workerId as unknown as ObjectId,
      createdBy: userId as unknown as ObjectId,
      type: payload.type,
      validated: false,
    };

    return this.tokenRepository.create(newToken);
  }
}
