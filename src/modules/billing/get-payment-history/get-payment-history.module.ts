import { Module } from '@nestjs/common';

import { GetPaymentHistoryController } from 'src/modules/billing/get-payment-history/get-payment-history.controller';
import { GetPaymentHistoryService } from 'src/modules/billing/get-payment-history/get-payment-history.service';
import { PaymentRepositoryModule } from 'src/modules/billing/repositories/payment.repository.module';

@Module({
  imports: [PaymentRepositoryModule],
  providers: [GetPaymentHistoryService],
  controllers: [GetPaymentHistoryController],
  exports: [GetPaymentHistoryService],
})
export class GetPaymentHistoryModule {}
