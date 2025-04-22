import * as dotenv from 'dotenv';
import { AIInstructions } from './types/AIInstructions';
import { registerChatInstructions } from './constants/prompts/registerChatInstructions';
import { whatsappRegisterInstructions } from './constants/prompts/whatsappRegisterInstructions';
import { messageDataParser } from './constants/prompts/messageDataParser';

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
  messageDataParser: AIInstructions;
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsS3BucketName: string;
  sendgridApiKey: string;
  emailDefaultFrom: string;
  finishSignUpTemplateId: string;
}

export const config: IConfig = {
  env: process.env.ENV || process.env.NODE_ENV,
  aiModel: process.env.AI_MODEL
    ? process.env.AI_MODEL.replace(/"/g, '')
    : 'gemini-2.0-flash-001',
  embeddingModel: process.env.EMBEDDING_MODEL
    ? process.env.EMBEDDING_MODEL.replace(/"/g, '')
    : 'text-embedding-005',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/anthor-agi',
  sentryDsn: process.env.SENTRY_DSN,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_API_KEY,
  registerChatInstructions: registerChatInstructions,
  whatsappRegisterInstructions: whatsappRegisterInstructions,
  messageDataParser: messageDataParser,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || 'anthor-documents',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  emailDefaultFrom: process.env.SENDGRID_EMAIL,
  finishSignUpTemplateId: process.env.FINISH_EMAIL_TEMPLATE_ID,
};
