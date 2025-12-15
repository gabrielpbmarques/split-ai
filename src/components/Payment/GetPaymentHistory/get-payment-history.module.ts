import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetPaymentHistoryController } from './get-payment-history.controller';
import { GetPaymentHistoryService } from './get-payment-history.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetPaymentHistoryService],
  controllers: [GetPaymentHistoryController],
  exports: [GetPaymentHistoryService],
})
export class GetPaymentHistoryModule {}
