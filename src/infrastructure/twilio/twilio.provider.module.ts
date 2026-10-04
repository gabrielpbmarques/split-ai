import { Module } from '@nestjs/common';

import { TwilioProvider } from 'src/infrastructure/twilio/twilio.provider';
import {
  TWILIO_CLIENT,
  TWILIO_SERVICE,
} from 'src/infrastructure/twilio/twilio.tokens';

@Module({
  providers: [...TwilioProvider],
  exports: [TWILIO_CLIENT, TWILIO_SERVICE],
})
export class TwilioProviderModule {}
