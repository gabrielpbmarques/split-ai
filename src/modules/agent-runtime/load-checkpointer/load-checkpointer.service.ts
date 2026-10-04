import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import {
  Injectable,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';

import { env } from 'src/shared/config/env';

const DB_URI = env.DATABASE_URL;

@Injectable()
export class LoadCheckpointerService
  implements OnModuleInit, OnApplicationShutdown
{
  private static saver?: PostgresSaver;

  async onModuleInit() {
    if (!LoadCheckpointerService.saver) {
      LoadCheckpointerService.saver = PostgresSaver.fromConnString(DB_URI);
      await LoadCheckpointerService.saver.setup();
    }
  }

  execute(): PostgresSaver {
    if (!LoadCheckpointerService.saver) {
      throw new Error('Checkpointer não inicializado');
    }

    return LoadCheckpointerService.saver;
  }

  async onApplicationShutdown(): Promise<void> {
    await LoadCheckpointerService.saver?.end();
    LoadCheckpointerService.saver = undefined;
  }
}
