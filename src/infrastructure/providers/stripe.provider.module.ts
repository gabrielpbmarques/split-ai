import { Module } from '@nestjs/common';

import { StripeProvider, STRIPE_CLIENT } from './stripe.provider';

@Module({
  providers: [...StripeProvider],
  exports: [STRIPE_CLIENT],
})
export class StripeProviderModule {}
