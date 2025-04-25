import * as dotenv from 'dotenv';
import { AIInstructions } from 'src/types/AIInstructions';
import { registerChatInstructions } from 'src/constants/prompts/registerChatInstructions';
import { whatsappRegisterInstructions } from 'src/constants/prompts/whatsappRegisterInstructions';
import { messageDataParser } from 'src/constants/prompts/messageDataParser';

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
  kafka?: {
    brokers: string;
    ssl: string;
    sasl: string;
    saslUsername: string;
    saslPassword: string;
  };
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
  messageDataParser: messageDataParser,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || 'anthor-documents',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  emailDefaultFrom: process.env.SENDGRID_EMAIL,
  finishSignUpTemplateId: process.env.FINISH_EMAIL_TEMPLATE_ID,
  kafka: process.env.KAFKA_BROKERS
    ? {
        brokers: process.env.KAFKA_BROKERS,
        ssl: process.env.KAFKA_SSL,
        sasl: process.env.KAFKA_SASL,
        saslUsername: process.env.KAFKA_SASL_USERNAME,
        saslPassword: process.env.KAFKA_SASL_PASSWORD,
      }
    : undefined,
};
