import { Injectable } from '@nestjs/common';
import { TokenRepository } from 'src/repositories/Token.repository';
import { ValidateTokenDTO } from './ValidateToken.dto';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';

@Injectable()
export class ValidateTokenService {
    constructor(
        private readonly tokenRepository: TokenRepository,
        private readonly calculateCheckDigitService: CalculateCheckDigitService
    ) { }

    async execute(payload: ValidateTokenDTO, workerId: string): Promise<boolean> {
        const token = await this.tokenRepository.findOne({
            workerId,
            activityId: payload.activityId,
            type: payload.type,
            token: payload.token
        });

        if (!token) {
            throw new Error('Token inválido');
        }
        
        const expired = token.expiresAt < new Date();

        if (expired) {
            throw new Error('Token expirado');
        }

        const [baseToken, checkDigit] = payload.token.split('-');

        if (!baseToken || !checkDigit) return false;

        return this.calculateCheckDigitService.execute(baseToken) === parseInt(checkDigit, 10);
    }
}
