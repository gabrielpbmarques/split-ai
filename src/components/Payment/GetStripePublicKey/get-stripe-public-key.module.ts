import { Module } from '@nestjs/common';

import { GetStripePublicKeyController } from './get-stripe-public-key.controller';
import { GetStripePublicKeyService } from './get-stripe-public-key.service';

@Module({
  providers: [GetStripePublicKeyService],
  controllers: [GetStripePublicKeyController],
  exports: [GetStripePublicKeyService],
})
export class GetStripePublicKeyModule {}
