import { Provider } from '@nestjs/common';
import Stripe from 'stripe';

import { config } from '../../config';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

export const StripeProvider: Provider[] = [
  {
    provide: STRIPE_CLIENT,
    useFactory: (): Stripe => {
      if (!config.stripeSecretKey) {
        throw new Error('Stripe secret key is not configured');
      }

      return new Stripe(config.stripeSecretKey, {
        apiVersion: '2023-10-16' as any,
        typescript: true,
      });
    },
  },
];
