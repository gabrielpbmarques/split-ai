import { Module } from '@nestjs/common';

import { GetCreditTransactionsController } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.controller';
import { GetCreditTransactionsService } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.service';
import { CreditTransactionRepositoryModule } from 'src/modules/billing/repositories/credit-transaction.repository.module';

@Module({
  imports: [CreditTransactionRepositoryModule],
  providers: [GetCreditTransactionsService],
  controllers: [GetCreditTransactionsController],
  exports: [GetCreditTransactionsService],
})
export class GetCreditTransactionsModule {}
