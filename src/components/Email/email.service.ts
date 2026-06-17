import { Inject, Injectable } from '@nestjs/common';
import {
  EmailService as IEmailService,
  EMAIL_SERVICE,
  EmailOptions,
} from 'src/infrastructure/providers/sendgrid.provider';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  async send(options: EmailOptions): Promise<void> {
    try {
      await this.emailService.send(options);
    } catch (error: any) {
      throw error;
    }
  }

  async sendWithTemplate(
    to: string,
    subject: string,
    templateId: string,
    data: Record<string, any>,
  ): Promise<void> {
    return this.send({
      to,
      subject,
      templateId,
      dynamicTemplateData: data,
    });
  }
}
