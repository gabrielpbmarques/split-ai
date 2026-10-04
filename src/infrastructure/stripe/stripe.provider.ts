import { Provider } from '@nestjs/common';
import Stripe from 'stripe';

import { STRIPE_CLIENT } from 'src/infrastructure/stripe/stripe.tokens';
import { env } from 'src/shared/config/env';

export const StripeProvider: Provider[] = [
  {
    provide: STRIPE_CLIENT,
    useFactory: (): Stripe => {
      if (!env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is not configured');
      }

      return new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as any,
        typescript: true,
      });
    },
  },
];
