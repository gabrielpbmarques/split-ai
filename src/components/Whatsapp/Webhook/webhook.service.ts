import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities';
import {
  TWILIO_SERVICE,
  ITwilioService,
} from 'src/infrastructure/providers/twilio.provider';
import { UserRepository } from 'src/repositories/user.repository';

import { WebhookDto } from './webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @Inject(TWILIO_SERVICE)
    private readonly twilioService: ITwilioService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(body: WebhookDto) {
    const { WaId } = body;

    let user = await this.userRepository.findByPhone(WaId);

    if (!user) {
      user = await this.createUser(body);
    }

    return this.twilioService.sendWhatsapp(WaId, 'Webhook funcionando!');
  }

  private async createUser(body: WebhookDto): Promise<UserEntity> {
    const { WaId, ProfileName } = body;

    return this.userRepository.create({
      phone: WaId,
      name: ProfileName,
      origin: 'whatsapp',
      status: 'active',
    });
  }
}
