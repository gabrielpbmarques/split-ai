import { Module } from '@nestjs/common';

import { GetStripePublicKeyController } from 'src/modules/billing/get-stripe-public-key/get-stripe-public-key.controller';
import { GetStripePublicKeyService } from 'src/modules/billing/get-stripe-public-key/get-stripe-public-key.service';

@Module({
  providers: [GetStripePublicKeyService],
  controllers: [GetStripePublicKeyController],
  exports: [GetStripePublicKeyService],
})
export class GetStripePublicKeyModule {}
