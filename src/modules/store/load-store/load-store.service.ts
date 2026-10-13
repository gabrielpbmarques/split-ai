import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import { Injectable } from '@nestjs/common';

import { env } from 'src/shared/config/env';

@Injectable()
export class LoadStoreService {
  private store?: PostgresStore;

  async execute(): Promise<PostgresStore> {
    if (!this.store) {
      const store = PostgresStore.fromConnString(env.DATABASE_URL);
      await store.setup();
      this.store = store;
    }
    return this.store;
  }
}
