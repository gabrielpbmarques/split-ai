import { Module } from '@nestjs/common';
import { EmailService } from 'src/components/Email/email.service';
import { SendGridProviderModule } from 'src/infrastructure/providers/sendgrid.provider.module';

@Module({
  imports: [SendGridProviderModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
