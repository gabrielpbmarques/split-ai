import { Provider } from '@nestjs/common';
import { Twilio } from 'twilio';

import { config } from '../../config';

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
}

class TwilioService implements ITwilioService {
  constructor(private readonly twilioClient: Twilio) {}

  async createCall(options: VoiceOptions): Promise<void> {
    await this.twilioClient.calls.create({
      from: config.twilioPhoneNumber,
      to: options.to,
      twiml: options.twiml,
    });
  }

  async sendSmsMessage(
    phone: string,
    code: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const message = `Seu código de verificação Nexguard é: ${code}. Válido por 10 minutos.`;

      await this.twilioClient.messages.create({
        body: message,
        from: config.twilioPhoneNumber,
        to: `+${phone.startsWith('55') ? phone : '55' + phone}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar SMS via Twilio:', error);
      return { success: false, message: error.message };
    }
  }
}

export const TwilioProvider: Provider[] = [
  {
    provide: TWILIO_CLIENT,
    useFactory: () => {
      if (!config.twilioAuthToken) {
        throw new Error('Twilio Auth Token must be provided');
      }
      if (!config.twilioAccountSid) {
        throw new Error('Twilio Account SID must be provided');
      }
      return new Twilio(config.twilioAccountSid, config.twilioAuthToken);
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
