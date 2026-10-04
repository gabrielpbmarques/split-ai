import { Inject, Injectable, Logger } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import {
  InboundWhatsappMessage,
  MESSAGING,
  MessagingGateway,
} from 'src/infrastructure/integration/messaging.port';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

const GREETING = 'Webhook funcionando!';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject(MESSAGING) private readonly messaging: MessagingGateway,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(form: Readonly<Record<string, unknown>>): Promise<void> {
    const inbound = this.messaging.parseInboundWhatsapp(form);

    if (!inbound) {
      this.logger.warn('Webhook do WhatsApp sem remetente identificável');
      return;
    }

    const user =
      (await this.userRepository.findByPhone(inbound.senderPhone)) ??
      (await this.createUser(inbound));

    this.logger.log(`Mensagem recebida do usuário ${user.id}`);

    await this.messaging.sendWhatsapp(inbound.senderPhone, GREETING);
  }

  private createUser(inbound: InboundWhatsappMessage): Promise<UserEntity> {
    return this.userRepository.create({
      phone: inbound.senderPhone,
      name: inbound.senderName,
      origin: 'whatsapp',
      status: 'active',
    });
  }
}
