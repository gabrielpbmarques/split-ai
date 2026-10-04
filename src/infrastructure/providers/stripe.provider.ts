import { Provider } from '@nestjs/common';
import { env } from 'src/shared/config/env';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

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
