import { Provider } from '@nestjs/common';
import { env } from 'src/shared/config/env';
import { Twilio } from 'twilio';

export const TWILIO_CLIENT = 'TWILIO_CLIENT';
export const TWILIO_SERVICE = 'TWILIO_SERVICE';

export interface VoiceOptions {
  to: string;
  twiml?: string;
}

export interface ITwilioService {
  createCall(options: VoiceOptions): Promise<void>;
  sendSmsMessage(
    phone: string,
    code: string,
  ): Promise<{ success: boolean; message?: string }>;
  sendWhatsapp(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; message?: string }>;
}

class TwilioService implements ITwilioService {
  constructor(private readonly twilioClient: Twilio) {}

  async createCall(options: VoiceOptions): Promise<void> {
    await this.twilioClient.calls.create({
      from: env.TWILIO_PHONE_NUMBER,
      to: options.to,
      twiml: options.twiml,
    });
  }

  async sendSmsMessage(
    phone: string,
    code: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const message = `Seu código de verificação Split AI é: ${code}. Válido por 10 minutos.`;

      await this.twilioClient.messages.create({
        body: message,
        from: env.TWILIO_PHONE_NUMBER,
        to: `+${phone.startsWith('55') ? phone : '55' + phone}`,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async sendWhatsapp(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:+${phone.startsWith('55') ? phone : '55' + phone}`,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export const TwilioProvider: Provider[] = [
  {
    provide: TWILIO_CLIENT,
    useFactory: () => {
      if (!env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio Auth Token must be provided');
      }
      if (!env.TWILIO_ACCOUNT_SID) {
        throw new Error('Twilio Account SID must be provided');
      }
      return new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    },
  },
  {
    provide: TWILIO_SERVICE,
    useFactory: (twilioClient: Twilio): ITwilioService => {
      return new TwilioService(twilioClient);
    },
    inject: [TWILIO_CLIENT],
  },
];
