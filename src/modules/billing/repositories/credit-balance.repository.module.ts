import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreditBalanceEntity } from 'src/infrastructure/database/schema';
import { CreditBalanceRepository } from 'src/modules/billing/repositories/credit-balance.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CreditBalanceEntity])],
  providers: [CreditBalanceRepository],
  exports: [CreditBalanceRepository],
})
export class CreditBalanceRepositoryModule {}
