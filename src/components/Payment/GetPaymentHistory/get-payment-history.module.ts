import { Module } from '@nestjs/common';
import { PaymentRepositoryModule } from 'src/repositories/payment.repository.module';

import { GetPaymentHistoryController } from './get-payment-history.controller';
import { GetPaymentHistoryService } from './get-payment-history.service';

@Module({
  imports: [PaymentRepositoryModule],
  providers: [GetPaymentHistoryService],
  controllers: [GetPaymentHistoryController],
  exports: [GetPaymentHistoryService],
})
export class GetPaymentHistoryModule {}
