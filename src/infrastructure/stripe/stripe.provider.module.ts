import { Module } from '@nestjs/common';

import { StripeProvider } from 'src/infrastructure/stripe/stripe.provider';
import { STRIPE_CLIENT } from 'src/infrastructure/stripe/stripe.tokens';

@Module({
  providers: [...StripeProvider],
  exports: [STRIPE_CLIENT],
})
export class StripeProviderModule {}
