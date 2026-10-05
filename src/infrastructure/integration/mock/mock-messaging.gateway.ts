import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import type {
  InboundWhatsappMessage,
  MessagingGateway,
} from 'src/infrastructure/integration/messaging.port';
import { parseInboundMessage } from 'src/infrastructure/integration/twilio/twilio.mappers';

export interface SentMessage {
  readonly channel: 'whatsapp';
  readonly phone: string;
  readonly text: string;
}

export class MockMessagingGateway implements MessagingGateway {
  readonly name = 'twilio';

  readonly sent: SentMessage[] = [];

  state(): IntegrationState {
    return 'MOCK';
  }

  async sendWhatsapp(phone: string, text: string): Promise<void> {
    this.sent.push({ channel: 'whatsapp', phone, text });
  }

  parseInboundWhatsapp(
    form: Readonly<Record<string, unknown>>,
  ): InboundWhatsappMessage | null {
    return parseInboundMessage(form);
  }
}
