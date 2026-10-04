import { Module } from '@nestjs/common';

import { CreateCheckoutController } from 'src/modules/billing/create-checkout/create-checkout.controller';
import { CreateCheckoutService } from 'src/modules/billing/create-checkout/create-checkout.service';
import { PaymentRepositoryModule } from 'src/modules/billing/repositories/payment.repository.module';
import { PlanRepositoryModule } from 'src/modules/billing/repositories/plan.repository.module';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [
    OrganizationRepositoryModule,
    PaymentRepositoryModule,
    PlanRepositoryModule,
  ],
  providers: [CreateCheckoutService],
  controllers: [CreateCheckoutController],
  exports: [CreateCheckoutService],
})
export class CreateCheckoutModule {}
