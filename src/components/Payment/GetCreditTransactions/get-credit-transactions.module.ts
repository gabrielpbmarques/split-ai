import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetCreditTransactionsController } from './get-credit-transactions.controller';
import { GetCreditTransactionsService } from './get-credit-transactions.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetCreditTransactionsService],
  controllers: [GetCreditTransactionsController],
  exports: [GetCreditTransactionsService],
})
export class GetCreditTransactionsModule {}
