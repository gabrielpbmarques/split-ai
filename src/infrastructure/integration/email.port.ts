import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const EMAIL = Symbol('EMAIL');

export interface EmailMessage {
  readonly to: string;
  readonly from?: string;
  readonly subject: string;
  readonly text?: string;
  readonly html?: string;
  readonly templateId?: string;
  readonly dynamicTemplateData?: Readonly<Record<string, unknown>>;
}

export interface EmailGateway extends IntegrationGateway {
  send(message: EmailMessage): Promise<void>;
}
