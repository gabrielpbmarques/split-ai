import { Module } from '@nestjs/common';

import { TransactionExecutor } from 'src/infrastructure/database/transaction-executor/transaction-executor.service';

@Module({
  providers: [TransactionExecutor],
  exports: [TransactionExecutor],
})
export class TransactionExecutorModule {}
