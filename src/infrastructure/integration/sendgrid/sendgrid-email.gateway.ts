import SendGrid from '@sendgrid/mail';

import type {
  EmailGateway,
  EmailMessage,
} from 'src/infrastructure/integration/email.port';
import {
  type IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import { env } from 'src/shared/config/env';

export class SendGridEmailGateway implements EmailGateway {
  readonly name = 'sendgrid';

  private readonly configured: boolean;

  constructor() {
    this.configured = Boolean(
      env.SENDGRID_API_KEY && env.SENDGRID_EMAIL_DEFAULT_FROM,
    );

    if (env.SENDGRID_API_KEY && this.configured) {
      SendGrid.setApiKey(env.SENDGRID_API_KEY);
    }
  }

  state(): IntegrationState {
    return this.configured ? 'READY' : 'NOT_CONFIGURED';
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.configured) {
      notConfigured(this.name);
    }

    const { to, from, subject, text, html, templateId, dynamicTemplateData } =
      message;

    await SendGrid.send({
      to,
      from: from ?? env.SENDGRID_EMAIL_DEFAULT_FROM,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
      ...(templateId ? { templateId } : {}),
      ...(dynamicTemplateData
        ? { dynamicTemplateData: { ...dynamicTemplateData } }
        : {}),
    } as SendGrid.MailDataRequired);
  }
}
