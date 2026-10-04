import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { env } from 'src/shared/config/env';

const DB_URI = env.DATABASE_URL;

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
