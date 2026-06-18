import * as dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  env: string;
  aiModel: string;
  embeddingModel: string;
  googleVertexAiApiKey: string;
  mongoUri: string;
  sentryDsn: string;
  redisUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  supabasePublishableKey: string;
  databaseHost: string;
  databasePort: string;
  databaseUserName: string;
  databasePassword: string;
  databaseName: string;
  databaseUrl: string;
  sendgridApiKey: string;
  emailDefaultFrom: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  twilioWhatsappNumber: string;
  spiderApiKey: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  langchainProject: string;
  langchainWorkspaceId: string;
  orchestratorModel: string;
}

export const config: IConfig = {
  env: process.env.ENV || process.env.NODE_ENV,
  aiModel: process.env.AI_MODEL,
  embeddingModel: process.env.EMBEDDING_MODEL,
  googleVertexAiApiKey: process.env.GOOGLE_VERTEX_AI_API_KEY,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/split-ai',
  sentryDsn: process.env.SENTRY_DSN,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  databaseHost: process.env.DATABASE_HOST,
  databasePort: process.env.DATABASE_PORT,
  databaseUserName: process.env.DATABASE_USERNAME,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseName: process.env.DATABASE_NAME,
  databaseUrl: process.env.DATABASE_URL,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  emailDefaultFrom: process.env.SENDGRID_EMAIL_DEFAULT_FROM,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  spiderApiKey: process.env.SPIDER_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  langchainProject: process.env.LANGCHAIN_PROJECT,
  langchainWorkspaceId: process.env.LANGCHAIN_WORKSPACE_ID,
  orchestratorModel: process.env.ORCHESTRATOR_MODEL || 'claude-sonnet-4-6',
};
