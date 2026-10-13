import { type Provider, ServiceUnavailableException } from '@nestjs/common';
import { Twilio } from 'twilio';
import { z } from 'zod';

import { env } from 'src/shared/config/env';

export const TWILIO_CLIENT = 'TWILIO_CLIENT';
export const TWILIO_SERVICE = 'TWILIO_SERVICE';
export const MESSAGING_SERVICE = TWILIO_SERVICE;

export interface InboundWhatsappMessage {
  readonly senderPhone: string;
  readonly senderName?: string;
  readonly text?: string;
  readonly messageId?: string;
}

export interface ITwilioService {
  sendWhatsapp(phone: string, text: string): Promise<void>;
  parseInboundWhatsapp(
    form: Readonly<Record<string, unknown>>,
  ): InboundWhatsappMessage | null;
}

const BRAZIL_COUNTRY_CODE = '55';

export const twilioInboundMessageSchema = z.object({
  WaId: z.string().min(1),
  ProfileName: z.string().optional(),
  Body: z.string().optional(),
  MessageSid: z.string().optional(),
  From: z.string().optional(),
});

export type TwilioInboundMessage = z.infer<typeof twilioInboundMessageSchema>;

export function mapInboundMessage(
  message: TwilioInboundMessage,
): InboundWhatsappMessage {
  return {
    senderPhone: message.WaId,
    senderName: message.ProfileName,
    text: message.Body,
    messageId: message.MessageSid,
  };
}

export function parseInboundMessage(
  form: Readonly<Record<string, unknown>>,
): InboundWhatsappMessage | null {
  const result = twilioInboundMessageSchema.safeParse(form);
  return result.success ? mapInboundMessage(result.data) : null;
}

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith(BRAZIL_COUNTRY_CODE)
    ? digits
    : `${BRAZIL_COUNTRY_CODE}${digits}`;

  return `+${withCountry}`;
}

class TwilioService implements ITwilioService {
  constructor(private readonly client: Twilio) {}

  async sendWhatsapp(phone: string, text: string): Promise<void> {
    await this.client.messages.create({
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

class MockTwilioService implements ITwilioService {
  readonly sent: Array<{ channel: 'whatsapp'; phone: string; text: string }> =
    [];

  async sendWhatsapp(phone: string, text: string): Promise<void> {
    this.sent.push({ channel: 'whatsapp', phone, text });
  }

  parseInboundWhatsapp(
    form: Readonly<Record<string, unknown>>,
  ): InboundWhatsappMessage | null {
    return parseInboundMessage(form);
  }
}

export const TwilioProvider: Provider[] = [
  {
    provide: TWILIO_CLIENT,
    useFactory: (): Twilio | null => {
      if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
        return null;
      }
      return new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    },
  },
  {
    provide: TWILIO_SERVICE,
    useFactory: (client: Twilio | null): ITwilioService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockTwilioService();
      }
      if (!client) {
        throw new ServiceUnavailableException('Twilio não configurado');
      }
      return new TwilioService(client);
    },
    inject: [TWILIO_CLIENT],
  },
];
