import { Module } from '@nestjs/common';
import { StripeProviderModule } from 'src/infrastructure/providers/stripe.provider.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';
import { PaymentRepositoryModule } from 'src/repositories/payment.repository.module';
import { PlanRepositoryModule } from 'src/repositories/plan.repository.module';

import { CreateCheckoutController } from './create-checkout.controller';
import { CreateCheckoutService } from './create-checkout.service';

@Module({
  imports: [
    OrganizationRepositoryModule,
    PaymentRepositoryModule,
    PlanRepositoryModule,
    StripeProviderModule,
  ],
  providers: [CreateCheckoutService],
  controllers: [CreateCheckoutController],
  exports: [CreateCheckoutService],
})
export class CreateCheckoutModule {}
