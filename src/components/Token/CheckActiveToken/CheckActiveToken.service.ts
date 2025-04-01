import { Injectable } from '@nestjs/common';
import { Token } from 'src/models/Token.model';
import { TokenRepository } from 'src/repositories/Token.repository';
import { TokenType } from 'src/types/TokenType';

@Injectable()
export class CheckActiveTokenService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute(activityId: string, type: TokenType): Promise<Token | null> {
    return this.tokenRepository.findOne({
      activityId,
      type,
      expiresAt: {
        $gte: new Date().toISOString(),
      },
    });
  }
}
