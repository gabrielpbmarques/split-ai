import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditTransactionEntity } from 'src/entities';

import { CreditTransactionRepository } from './credit-transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CreditTransactionEntity])],
  providers: [CreditTransactionRepository],
  exports: [CreditTransactionRepository],
})
export class CreditTransactionRepositoryModule {}
