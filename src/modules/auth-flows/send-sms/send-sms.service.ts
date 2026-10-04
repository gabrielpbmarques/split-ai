import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  Logger,
} from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema/user.entity';
import {
  MESSAGING,
  MessagingGateway,
} from 'src/infrastructure/integration/messaging.port';
import { SmsVerificationRepository } from 'src/modules/auth-flows/repositories/sms-verification.repository';
import { SendSmsDto } from 'src/modules/auth-flows/send-sms/send-sms.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { cleanPhoneNumber } from 'src/shared/utils/clean-phone-number';

export interface SendSmsResult {
  success: true;
  message: string;
}

@Injectable()
export class SendSmsService {
  private readonly logger = new Logger(SendSmsService.name);

  constructor(
    @Inject(MESSAGING) private readonly messaging: MessagingGateway,
    private readonly smsVerificationRepository: SmsVerificationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(sendSmsDto: SendSmsDto): Promise<SendSmsResult> {
    const cleanPhone = cleanPhoneNumber(sendSmsDto.phone);

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

    await this.messaging
      .sendSms(cleanPhone, this.buildMessage(verificationCode))
      .catch((error) => {
        this.logger.error('Falha ao enviar SMS', error);
        throw new InternalServerErrorException('Falha ao enviar SMS', error);
      });

    return {
      success: true,
      message: 'Código de verificação enviado com sucesso',
    };
  }

  private isValidBrazilianPhone(phone: string): boolean {
    return /^55\d{10,11}$/.test(phone) || /^\d{10,11}$/.test(phone);
  }

  private buildMessage(code: string): string {
    return `Seu código de verificação Split AI é: ${code}. Válido por 10 minutos.`;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
