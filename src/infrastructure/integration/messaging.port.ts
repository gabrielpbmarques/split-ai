import type { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const MESSAGING = Symbol('MESSAGING');

export interface InboundWhatsappMessage {
  readonly senderPhone: string;
  readonly senderName?: string;
  readonly text?: string;
  readonly messageId?: string;
}

export interface MessagingGateway extends IntegrationGateway {
  sendSms(phone: string, text: string): Promise<void>;
  sendWhatsapp(phone: string, text: string): Promise<void>;
  parseInboundWhatsapp(
    form: Readonly<Record<string, unknown>>,
  ): InboundWhatsappMessage | null;
}
