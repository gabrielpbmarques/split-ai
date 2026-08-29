import { Module } from '@nestjs/common';

import {
  SendGridProvider,
  SENDGRID_CLIENT,
  EMAIL_SERVICE,
} from './sendgrid.provider';

@Module({
  providers: [...SendGridProvider],
  exports: [SENDGRID_CLIENT, EMAIL_SERVICE],
})
export class SendGridProviderModule {}
