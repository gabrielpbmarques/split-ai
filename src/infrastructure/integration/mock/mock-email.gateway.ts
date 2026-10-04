import {
  EmailGateway,
  EmailMessage,
} from 'src/infrastructure/integration/email.port';
import { IntegrationState } from 'src/infrastructure/integration/integration.state';

export class MockEmailGateway implements EmailGateway {
  readonly name = 'sendgrid';

  readonly sent: EmailMessage[] = [];

  state(): IntegrationState {
    return 'MOCK';
  }

  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
  }
}
