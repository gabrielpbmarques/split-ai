import { BadRequestException, Injectable } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema/user.entity';
import { GenerateTokenService } from 'src/modules/auth-flows/generate-token/generate-token.service';
import { SmsVerificationRepository } from 'src/modules/auth-flows/repositories/sms-verification.repository';
import type { VerifySmsDto } from 'src/modules/auth-flows/verify-sms/verify-sms.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { cleanPhoneNumber } from 'src/shared/utils/clean-phone-number';

export interface VerifySmsResult {
  success: true;
  message: string;
  user_id: string;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class VerifySmsService {
  constructor(
    private readonly smsVerificationRepository: SmsVerificationRepository,
    private readonly userRepository: UserRepository,
    private readonly generateTokenService: GenerateTokenService,
  ) {}

  async execute(verifySmsDto: VerifySmsDto): Promise<VerifySmsResult> {
    const cleanPhone = cleanPhoneNumber(verifySmsDto.phone);

    const verification = await this.smsVerificationRepository.findValidCode(
      cleanPhone,
      verifySmsDto.code,
    );

    if (!verification) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    await this.smsVerificationRepository.markAsVerified(verification.id);

    let user = await this.userRepository.findByPhone(cleanPhone);

    if (!user) {
      const newUser = new UserEntity();
      newUser.phone = cleanPhone;
      newUser.name = verifySmsDto.name || 'Visitante';
      newUser.role = 'guest';
      newUser.origin = 'website';
      newUser.status = 'active';

      user = await this.userRepository.create(newUser);
    }

    const tokenResult = await this.generateTokenService.execute(user!);

    return {
      success: true,
      message: 'Telefone verificado com sucesso',
      user_id: user!.id,
      token: tokenResult.token,
      expiresAt: tokenResult.expiresAt,
    };
  }
}
