import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreditTransactionEntity } from 'src/infrastructure/database/schema';
import { CreditTransactionRepository } from 'src/modules/billing/repositories/credit-transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CreditTransactionEntity])],
  providers: [CreditTransactionRepository],
  exports: [CreditTransactionRepository],
})
export class CreditTransactionRepositoryModule {}
