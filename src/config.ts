import * as dotenv from 'dotenv';
import { AIInstructions } from './types/AIInstructions';
import { registerChatInstructions } from './constants/prompts/registerChatInstructions';
import { whatsappRegisterInstructions } from './constants/prompts/whatsappRegisterInstructions';

dotenv.config();

interface IConfig {
  env: string;
  aiModel: string;
  embeddingModel: string;
  mongoUri: string;
  sentryDsn: string;
  redisUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  registerChatInstructions: AIInstructions;
  whatsappRegisterInstructions: AIInstructions;
}

export const config: IConfig = {
  env: process.env.ENV || process.env.NODE_ENV,
  aiModel: process.env.AI_MODEL,
  embeddingModel: process.env.EMBEDDING_MODEL,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/anthor-agi',
  sentryDsn: process.env.SENTRY_DSN,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_API_KEY,
  registerChatInstructions: registerChatInstructions,
  whatsappRegisterInstructions: whatsappRegisterInstructions,
};
