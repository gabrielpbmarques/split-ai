import { Injectable } from '@nestjs/common';
import { env } from 'src/shared/config/env';

@Injectable()
export class GetStripePublicKeyService {
  async execute() {
    return { publicKey: env.STRIPE_PUBLISHABLE_KEY };
  }
}
