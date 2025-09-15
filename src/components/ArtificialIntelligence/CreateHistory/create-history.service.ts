import { RedisChatMessageHistory } from '@langchain/redis';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class CreateHistoryService {
  private buildRedisConfig() {
    if (!config.redisUrl) {
      throw new Error('REDIS_URL is not configured');
    }

    return {
      url: config.redisUrl,
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
        keepAlive: 30000,
      },
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };
  }

  constructor() {}

  execute(sessionId: string): RedisChatMessageHistory {
    const history = new RedisChatMessageHistory({
      sessionId,
      config: this.buildRedisConfig(),
    });

    return history;
  }
}
