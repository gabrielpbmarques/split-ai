import { Injectable } from '@nestjs/common';
import { Token } from 'src/models/Token.model';
import { TokenRepository } from 'src/repositories/Token.repository';
import { CreateTokenDTO } from './CreateToken.dto';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';

@Injectable()
export class CreateTokenService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly calculateCheckDigitService: CalculateCheckDigitService
  ) {}

  async execute(payload: CreateTokenDTO): Promise<Token> {
    const existingToken = await this.tokenRepository.findByWorkerAndActivity(
      payload.workerId,
      payload.activityId,
      payload.type
    );

    if (existingToken) {
      return existingToken;
    }

    const baseToken = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    const checkDigit = this.calculateCheckDigitService.execute(baseToken);

    // expiration time should be 1 minute from now
    const expiresAt = payload.expiresAt || new Date(new Date().getTime() + 60000);

    const newToken: Omit<Token, '_id' | 'createdAt' | 'updatedAt'> = {
      token: `${baseToken}-${checkDigit}`,
      expiresAt,
      activityId: payload.activityId,
      workerId: payload.workerId,
      type: payload.type
    };

    return this.tokenRepository.create(newToken);
  }
}
