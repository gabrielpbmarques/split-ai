import { MemorySaver } from '@langchain/langgraph';
import type { BaseCheckpointSaver } from '@langchain/langgraph-checkpoint';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Injectable } from '@nestjs/common';

import { env } from 'src/shared/config/env';

@Injectable()
export class LoadCheckpointerService {
  private checkpointer?: BaseCheckpointSaver;

  async execute(): Promise<BaseCheckpointSaver> {
    if (!this.checkpointer) {
      if (env.INTEGRATION_MODE === 'mock') {
        this.checkpointer = new MemorySaver();
      } else {
        const saver = PostgresSaver.fromConnString(env.DATABASE_URL);
        await saver.setup();
        this.checkpointer = saver;
      }
    }
    return this.checkpointer;
  }
}
