import { Injectable } from '@nestjs/common';
import { TokenRepository } from 'src/repositories/Token.repository';
import { ValidateTokenDTO } from './ValidateToken.dto';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { UpdateActivityTokenService } from 'src/components/Activity/UpdateActivityToken/UpdateActivityToken.service';

@Injectable()
export class ValidateTokenService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly calculateCheckDigitService: CalculateCheckDigitService,
    private readonly updateActivityTokenService: UpdateActivityTokenService,
  ) {}

  async execute(payload: ValidateTokenDTO, workerId: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({
      workerId,
      activityId: payload.activityId,
      type: payload.type,
      token: payload.token,
    });

    if (!token) {
      throw new Error('Token inválido');
    }

    const alreadyValidated = token.validated;

    if (alreadyValidated) {
      throw new Error('Token já validado');
    }

    const expired = token.expiresAt < new Date();

    if (expired) {
      throw new Error('Token expirado');
    }

    // Extract the base token and check digit without assuming a hyphen separator
    const tokenString = payload.token;

    // Check if token is malformed (too short or non-numeric)
    if (tokenString.length < 2 || !/^\d+$/.test(tokenString)) {
      return false;
    }

    const baseToken = tokenString.slice(0, -1); // All characters except the last one
    const checkDigit = tokenString.slice(-1); // Last character

    const isValid =
      this.calculateCheckDigitService.execute(baseToken) ===
      parseInt(checkDigit, 10);

    if (!isValid) {
      throw new Error('Token inválido');
    }

    const updatedToken = await this.tokenRepository.updateOne(token._id, {
      validated: true,
      validatedAt: new Date(),
    });
    await this.updateActivityTokenService.execute(
      updatedToken,
      payload.activityId,
    );

    return true;
  }
}
