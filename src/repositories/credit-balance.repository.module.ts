import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditBalanceEntity } from 'src/entities';

import { CreditBalanceRepository } from './credit-balance.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CreditBalanceEntity])],
  providers: [CreditBalanceRepository],
  exports: [CreditBalanceRepository],
})
export class CreditBalanceRepositoryModule {}
