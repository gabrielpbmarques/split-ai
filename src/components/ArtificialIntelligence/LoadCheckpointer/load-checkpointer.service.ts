import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';

const DB_URI = config.databaseUrl;

@Injectable()
export class LoadCheckpointerService {
  private checkpointer: PostgresSaver;
  constructor() {
    this.checkpointer = PostgresSaver.fromConnString(DB_URI);
    this.checkpointer.setup();
  }

  execute(): PostgresSaver {
    return this.checkpointer;
  }
}
