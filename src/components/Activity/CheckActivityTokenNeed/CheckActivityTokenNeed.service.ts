import { Injectable } from '@nestjs/common';
import { TokenRepository } from 'src/repositories/Token.repository';

@Injectable()
export class CheckActivityTokenNeedService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute(activityId: string): Promise<boolean> {
    const hasToken = await this.tokenRepository.findOne({ activityId });
    return !!hasToken;
  }
}
