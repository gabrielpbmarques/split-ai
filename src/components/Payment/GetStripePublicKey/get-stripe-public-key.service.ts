import { Injectable } from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class GetStripePublicKeyService {
  async execute() {
    return { publicKey: config.stripePublishableKey };
  }
}
