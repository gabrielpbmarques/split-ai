import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import {
  ITwilioService,
  TWILIO_SERVICE,
} from 'src/infrastructure/providers/twilio.provider';

import { SmsVerificationRepository } from '../../../repositories/sms-verification.repository';
import { UserRepository } from '../../../repositories/user.repository';

import { SendSmsDto, VerifySmsDto } from './send-sms.dto';

@Injectable()
export class SendSmsService {
  constructor(
    @Inject(TWILIO_SERVICE)
    private readonly twilioService: ITwilioService,
    private readonly smsVerificationRepository: SmsVerificationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(sendSmsDto: SendSmsDto) {
    const cleanPhone = this.cleanPhoneNumber(sendSmsDto.phone);

    if (!this.isValidBrazilianPhone(cleanPhone)) {
      throw new BadRequestException('Número de telefone inválido');
    }

    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.smsVerificationRepository.upsert({
      phone: cleanPhone,
      code: verificationCode,
      expires_at: expiresAt,
      verified: false,
      user_id: sendSmsDto.userId,
    });

    const smsResult = await this.twilioService.sendSmsMessage(
      cleanPhone,
      verificationCode,
    );

    if (!smsResult.success) {
      throw new InternalServerErrorException('Falha ao enviar SMS');
    }

    return {
      success: true,
      message: 'Código de verificação enviado com sucesso',
    };
  }

  async verify(verifySmsDto: VerifySmsDto) {
    const cleanPhone = this.cleanPhoneNumber(verifySmsDto.phone);

    const verification = await this.smsVerificationRepository.findValidCode(
      cleanPhone,
      verifySmsDto.code,
      verifySmsDto.userId,
    );

    if (!verification) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    await this.smsVerificationRepository.markAsVerified(verification.id);

    const user = await this.userRepository.findById(verifySmsDto.userId);

    if (user) {
      await this.userRepository.update(user.id, {
        status: 'active',
      });
    }

    return {
      success: true,
      message: 'Telefone verificado com sucesso',
      user_id: user?.id || verification.user_id,
    };
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private isValidBrazilianPhone(phone: string): boolean {
    return /^55\d{10,11}$/.test(phone) || /^\d{10,11}$/.test(phone);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
