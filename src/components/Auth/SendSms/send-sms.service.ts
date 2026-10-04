import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  Logger,
} from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import {
  ITwilioService,
  TWILIO_SERVICE,
} from 'src/infrastructure/providers/twilio.provider';
import { SmsVerificationRepository, UserRepository } from 'src/repositories';

import { GenerateTokenService } from '../GenerateToken/generate-token.service';

import { SendSmsDto, VerifySmsDto } from './send-sms.dto';

@Injectable()
export class SendSmsService {
  private readonly logger = new Logger(SendSmsService.name);

  constructor(
    @Inject(TWILIO_SERVICE)
    private readonly twilioService: ITwilioService,
    private readonly smsVerificationRepository: SmsVerificationRepository,
    private readonly userRepository: UserRepository,
    private readonly generateTokenService: GenerateTokenService,
  ) {}

  async execute(sendSmsDto: SendSmsDto) {
    const cleanPhone = this.cleanPhoneNumber(sendSmsDto.phone);

    if (!this.isValidBrazilianPhone(cleanPhone)) {
      throw new BadRequestException('Número de telefone inválido');
    }

    let user: UserEntity | null = null;

    if (!sendSmsDto.isGuest) {
      user = await this.userRepository.findByPhone(cleanPhone);

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      if (sendSmsDto.userId && sendSmsDto.userId !== user.id) {
        throw new BadRequestException(
          'Usuário divergente para o telefone informado',
        );
      }
    } else {
      if (!sendSmsDto.name) {
        throw new BadRequestException('Nome é obrigatório para visitantes');
      }
    }

    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.smsVerificationRepository.upsert({
      phone: cleanPhone,
      code: verificationCode,
      expires_at: expiresAt,
      verified: false,
      user_id: user?.id,
    });

    await this.twilioService
      .sendSmsMessage(cleanPhone, verificationCode)
      .catch((error) => {
        this.logger.error('Falha ao enviar SMS', error);
        throw new InternalServerErrorException('Falha ao enviar SMS', error);
      });

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
