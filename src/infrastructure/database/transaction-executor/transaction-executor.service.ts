import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Executor } from 'src/infrastructure/database/database.types';

@Injectable()
export class TransactionExecutor {
  constructor(private readonly dataSource: DataSource) {}

  run<TResult>(work: (tx: Executor) => Promise<TResult>): Promise<TResult> {
    return this.dataSource.transaction(work);
  }
}
