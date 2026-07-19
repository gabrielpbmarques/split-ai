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
  // --- ElevenLabs (voice) ---
  // API key (required to use ELEVEN_LABS_SERVICE). The voice/model/output/STT
  // ids are optional overrides with sensible defaults below.
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  elevenLabsModelId: string;
  elevenLabsOutputFormat: string;
  elevenLabsSttModelId: string;
  langchainProject: string;
  langchainWorkspaceId: string;
  orchestratorModel: string;
  // --- BravoHub platform integration (analytics assistant) ---
  // Secret used to verify the BravoHub dashboard JWT (HS512) forwarded by the
  // platform. Must equal bravohub-api's `JWT_SECRET`. When set, the Bearer auth
  // path also accepts a BravoHub token and derives a trusted `company_id` scope.
  bravohubJwtSecret: string;
  // split-ai organization that owns the analytics ("Oracle") agent — used to
  // attribute sessions/token-usage for BravoHub platform calls.
  bravohubOrgId: string;
  // Agent ids/identifiers that read the shared multi-tenant BravoHub database
  // and therefore MUST run under a verified company scope (fail-closed).
  bravohubScopedAgents: string[];
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
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
  elevenLabsModelId:
    process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
  elevenLabsOutputFormat:
    process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128',
  elevenLabsSttModelId: process.env.ELEVENLABS_STT_MODEL_ID || 'scribe_v1',
  langchainProject: process.env.LANGCHAIN_PROJECT,
  langchainWorkspaceId: process.env.LANGCHAIN_WORKSPACE_ID,
  orchestratorModel: process.env.ORCHESTRATOR_MODEL || 'claude-sonnet-4-6',
  bravohubJwtSecret: process.env.BRAVOHUB_JWT_SECRET,
  bravohubOrgId: process.env.BRAVOHUB_ORG_ID,
  bravohubScopedAgents: (
    process.env.BRAVOHUB_SCOPED_AGENTS ||
    'a951e928-2b86-4737-8aee-88fde5eb27d6,analytics-oracle,analytics-sql-analyst'
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
};
