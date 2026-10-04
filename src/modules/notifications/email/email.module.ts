import { Module } from '@nestjs/common';

import { SendGridProviderModule } from 'src/infrastructure/sendgrid/sendgrid.provider.module';
import { EmailService } from 'src/modules/notifications/email/email.service';

@Module({
  imports: [SendGridProviderModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
