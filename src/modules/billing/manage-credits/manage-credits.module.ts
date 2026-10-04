import { Module } from '@nestjs/common';

import { ManageCreditsService } from 'src/modules/billing/manage-credits/manage-credits.service';
import { CreditBalanceRepositoryModule } from 'src/modules/billing/repositories/credit-balance.repository.module';
import { CreditTransactionRepositoryModule } from 'src/modules/billing/repositories/credit-transaction.repository.module';

@Module({
  imports: [CreditBalanceRepositoryModule, CreditTransactionRepositoryModule],
  providers: [ManageCreditsService],
  exports: [ManageCreditsService],
})
export class ManageCreditsModule {}
