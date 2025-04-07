import { Injectable } from '@nestjs/common';
import { RedisChatMessageHistory } from '@langchain/redis';
import { config } from 'src/config';

@Injectable()
export class CreateHistoryService {
  constructor() {}

  execute(sessionId: string): RedisChatMessageHistory {
    const history = new RedisChatMessageHistory({
      sessionId,
      config: {
        url: config.redisUrl,
      },
    });

    return history;
  }
}
