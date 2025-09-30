import { RedisChatMessageHistory } from '@langchain/redis';
import { Injectable, Logger } from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class CreateHistoryService {
  private readonly logger = new Logger(CreateHistoryService.name);

  private buildRedisConfig() {
    if (!config.redisUrl) {
      this.logger.warn(
        'REDIS_URL is not configured - chat history will not persist',
      );
      return null;
    }

    try {
      const url = new URL(config.redisUrl);

      const baseConfig: any = {
        url: config.redisUrl,
        socket: {
          connectTimeout: 10000,
          lazyConnect: true,
        },
      };

      if (url.protocol === 'rediss:') {
        baseConfig.socket.tls = true;
      }

      return baseConfig;
    } catch (error) {
      this.logger.error('Invalid REDIS_URL format:', error.message);
      return null;
    }
  }

  constructor() {}

  execute(sessionId: string): RedisChatMessageHistory | null {
    const redisConfig = this.buildRedisConfig();

    if (!redisConfig) {
      this.logger.warn(
        `Chat history for session ${sessionId} will not persist - Redis not available`,
      );
      return null;
    }

    try {
      const history = new RedisChatMessageHistory({
        sessionId,
        config: redisConfig,
      });

      return history;
    } catch (error) {
      this.logger.error('Failed to create Redis chat history:', error.message);
      return null;
    }
  }
}
