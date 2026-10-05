import { Twilio } from 'twilio';

import {
  type IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import type {
  InboundWhatsappMessage,
  MessagingGateway,
} from 'src/infrastructure/integration/messaging.port';
import {
  parseInboundMessage,
  toE164,
} from 'src/infrastructure/integration/twilio/twilio.mappers';
import { env } from 'src/shared/config/env';

export class TwilioMessagingGateway implements MessagingGateway {
  readonly name = 'twilio';

  private readonly client?: Twilio;

  constructor() {
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      this.client = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    }
  }

  state(): IntegrationState {
    return this.client ? 'READY' : 'NOT_CONFIGURED';
  }

  async sendWhatsapp(phone: string, text: string): Promise<void> {
    const client = this.client ?? notConfigured(this.name);

    await client.messages.create({
      body: text,
      from: `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${toE164(phone)}`,
    });
  }

  parseInboundWhatsapp(
    form: Readonly<Record<string, unknown>>,
  ): InboundWhatsappMessage | null {
    return parseInboundMessage(form);
  }
}
