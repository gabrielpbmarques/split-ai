import { Module } from '@nestjs/common';

import {
  TwilioProvider,
  TWILIO_CLIENT,
  TWILIO_SERVICE,
} from './twilio.provider';

@Module({
  providers: [...TwilioProvider],
  exports: [TWILIO_CLIENT, TWILIO_SERVICE],
})
export class TwilioProviderModule {}
