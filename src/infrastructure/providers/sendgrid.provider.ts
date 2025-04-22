import { Provider } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { config } from 'src/config';

export const SENDGRID_CLIENT = 'SENDGRID_CLIENT';
export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export interface EmailService {
  send(options: EmailOptions): Promise<void>;
  sendWithTemplate(
    to: string,
    subject: string,
    templateId: string,
    dynamicData: Record<string, any>,
  ): Promise<void>;
}

class SendGridEmailService implements EmailService {
  constructor(private readonly defaultFrom: string) {
    SendGrid.setApiKey(config.sendgridApiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    const {
      to,
      from = this.defaultFrom,
      subject,
      text,
      html,
      templateId,
      dynamicTemplateData,
    } = options;

    const msg: SendGrid.MailDataRequired = {
      to,
      from,
      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(templateId && { templateId }),
      ...(dynamicTemplateData && { dynamicTemplateData }),
    };

    await SendGrid.send(msg);
  }

  async sendWithTemplate(
    to: string,
    subject: string,
    templateId: string,
    dynamicData: Record<string, any>,
  ): Promise<void> {
    return this.send({
      to,
      subject,
      templateId,
      dynamicTemplateData: dynamicData,
    });
  }
}

export const SendGridProvider: Provider[] = [
  {
    provide: SENDGRID_CLIENT,
    useFactory: () => {
      if (!config.sendgridApiKey) {
        throw new Error('SendGrid API key must be provided');
      }
      return SendGrid;
    },
  },
  {
    provide: EMAIL_SERVICE,
    useFactory: () => {
      if (!config.sendgridApiKey) {
        throw new Error('SendGrid API key must be provided');
      }
      if (!config.emailDefaultFrom) {
        throw new Error('Default from email address must be provided');
      }
      return new SendGridEmailService(config.emailDefaultFrom);
    },
  },
];
