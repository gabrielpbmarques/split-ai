import * as dotenv from 'dotenv';
import { AIInstructions } from './types/AIInstructions';
import { registerChatInstructions } from './constants/prompts/registerChatInstructions';

dotenv.config();

interface IConfig {
  env: string;
  aiModel: string;
  mongoUri: string;
  sentryDsn: string;
  redisUrl: string;
  registerChatInstructions: AIInstructions;
}

export const config: IConfig = {
  env: process.env.ENV || process.env.NODE_ENV,
  aiModel: process.env.AI_MODEL,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/anthor-agi',
  sentryDsn: process.env.SENTRY_DSN,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  registerChatInstructions: registerChatInstructions,
};
