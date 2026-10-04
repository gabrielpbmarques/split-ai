import { Inject, Injectable } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import { ITwilioService } from 'src/infrastructure/twilio/twilio.provider';
import { TWILIO_SERVICE } from 'src/infrastructure/twilio/twilio.tokens';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { WebhookDto } from 'src/modules/whatsapp/webhook/webhook.dto';

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
