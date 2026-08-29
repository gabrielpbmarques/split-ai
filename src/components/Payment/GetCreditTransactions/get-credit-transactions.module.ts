import { Module } from '@nestjs/common';
import { CreditTransactionRepositoryModule } from 'src/repositories/credit-transaction.repository.module';

import { GetCreditTransactionsController } from './get-credit-transactions.controller';
import { GetCreditTransactionsService } from './get-credit-transactions.service';

@Module({
  imports: [CreditTransactionRepositoryModule],
  providers: [GetCreditTransactionsService],
  controllers: [GetCreditTransactionsController],
  exports: [GetCreditTransactionsService],
})
export class GetCreditTransactionsModule {}
