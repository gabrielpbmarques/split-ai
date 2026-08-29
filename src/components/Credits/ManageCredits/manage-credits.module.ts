import { Module } from '@nestjs/common';
import { CreditBalanceRepositoryModule } from 'src/repositories/credit-balance.repository.module';
import { CreditTransactionRepositoryModule } from 'src/repositories/credit-transaction.repository.module';

import { ManageCreditsService } from './manage-credits.service';

@Module({
  imports: [CreditBalanceRepositoryModule, CreditTransactionRepositoryModule],
  providers: [ManageCreditsService],
  exports: [ManageCreditsService],
})
export class ManageCreditsModule {}
