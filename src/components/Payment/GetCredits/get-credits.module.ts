import { Module } from '@nestjs/common';
import { CreditBalanceRepositoryModule } from 'src/repositories/credit-balance.repository.module';

import { GetCreditsController } from './get-credits.controller';
import { GetCreditsService } from './get-credits.service';

@Module({
  imports: [CreditBalanceRepositoryModule],
  providers: [GetCreditsService],
  controllers: [GetCreditsController],
  exports: [GetCreditsService],
})
export class GetCreditsModule {}
