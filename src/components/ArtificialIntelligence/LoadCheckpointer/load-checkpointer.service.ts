import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { config } from 'src/config';

const DB_URI = config.databaseUrl;

@Injectable()
export class LoadCheckpointerService implements OnModuleInit {
  private static saver: PostgresSaver;

  async onModuleInit() {
    if (!LoadCheckpointerService.saver) {
      LoadCheckpointerService.saver = PostgresSaver.fromConnString(DB_URI);
      await LoadCheckpointerService.saver.setup();
    }
  }

  execute(): PostgresSaver {
    return LoadCheckpointerService.saver;
  }
}
