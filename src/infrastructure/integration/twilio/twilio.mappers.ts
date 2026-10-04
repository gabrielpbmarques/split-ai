import type { InboundWhatsappMessage } from 'src/infrastructure/integration/messaging.port';
import {
  type TwilioInboundMessage,
  twilioInboundMessageSchema,
} from 'src/infrastructure/integration/twilio/twilio.contracts';

const BRAZIL_COUNTRY_CODE = '55';

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
