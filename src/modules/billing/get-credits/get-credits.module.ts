import { Module } from '@nestjs/common';

import { GetCreditsController } from 'src/modules/billing/get-credits/get-credits.controller';
import { GetCreditsService } from 'src/modules/billing/get-credits/get-credits.service';
import { CreditBalanceRepositoryModule } from 'src/modules/billing/repositories/credit-balance.repository.module';

@Module({
  imports: [CreditBalanceRepositoryModule],
  providers: [GetCreditsService],
  controllers: [GetCreditsController],
  exports: [GetCreditsService],
})
export class GetCreditsModule {}
