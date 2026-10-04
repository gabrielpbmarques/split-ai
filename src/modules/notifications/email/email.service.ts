import { Inject, Injectable } from '@nestjs/common';

import {
  EMAIL,
  EmailGateway,
  EmailMessage,
} from 'src/infrastructure/integration/email.port';

@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL) private readonly email: EmailGateway) {}

  async execute(message: EmailMessage): Promise<void> {
    await this.email.send(message);
  }
}
