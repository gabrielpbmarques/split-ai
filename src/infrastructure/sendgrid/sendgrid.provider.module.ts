import { Module } from '@nestjs/common';

import { SendGridProvider } from 'src/infrastructure/sendgrid/sendgrid.provider';
import {
  SENDGRID_CLIENT,
  EMAIL_SERVICE,
} from 'src/infrastructure/sendgrid/sendgrid.tokens';

@Module({
  providers: [...SendGridProvider],
  exports: [SENDGRID_CLIENT, EMAIL_SERVICE],
})
export class SendGridProviderModule {}
