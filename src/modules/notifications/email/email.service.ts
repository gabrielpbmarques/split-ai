import { Inject, Injectable } from '@nestjs/common';

import {
  EmailService as IEmailService,
  EmailOptions,
} from 'src/infrastructure/sendgrid/sendgrid.provider';
import { EMAIL_SERVICE } from 'src/infrastructure/sendgrid/sendgrid.tokens';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  async execute(options: EmailOptions): Promise<void> {
    await this.emailService.send(options);
  }
}
