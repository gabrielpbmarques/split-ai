import 'dotenv/config';
import { z } from 'zod';

const nodeEnv = z.enum(['development', 'test', 'production']);

const csvList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

const booleanFlag = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const originList = csvList.refine(
  (origins) => !origins.includes('*'),
  'ALLOWED_ORIGINS não aceita "*"; liste as origens explicitamente',
);

const envSchema = z.object({
  NODE_ENV: nodeEnv.default('development'),
  ENV: nodeEnv.optional(),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  FRONTEND_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: originList,
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
  SWAGGER_ENABLED: booleanFlag,

  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(1),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(10),
  DATABASE_STATEMENT_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(30_000),
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(10_000),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRATION_HOURS: z.coerce.number().int().positive().default(24),
  BRAVOHUB_JWT_SECRET: z.string().min(1).optional(),
  BRAVOHUB_ORG_ID: z.string().min(1).optional(),
  BRAVOHUB_SCOPED_AGENTS: csvList,
  AUTH_PRINCIPAL_CACHE_TTL_MS: z.coerce.number().int().min(0).default(30_000),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).optional(),
  ORCHESTRATOR_MODEL: z.string().min(1).default('claude-sonnet-4-6'),
  LANGCHAIN_PROJECT: z.string().min(1).optional(),

  VOYAGEAI_API_KEY: z.string().min(1).optional(),
  EMBEDDING_MODEL: z.string().min(1).optional(),
  RERANK_MODEL: z.string().min(1).default('rerank-2.5'),
  VECTOR_SEARCH_CANDIDATE_K: z.coerce.number().int().positive().default(50),
  VECTOR_SEARCH_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.8),
  VECTOR_SEARCH_MAX_RESULTS: z.coerce.number().int().positive().default(10),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  SENTRY_DSN: z.string().url().optional(),

  SENDGRID_API_KEY: z.string().min(1).optional(),
  SENDGRID_EMAIL_DEFAULT_FROM: z.string().min(1).optional(),

  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().min(1).optional(),

  SPIDER_API_KEY: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  ELEVENLABS_API_KEY: z.string().min(1).optional(),
  ELEVENLABS_VOICE_ID: z.string().min(1).default('21m00Tcm4TlvDq8ikWAM'),
  ELEVENLABS_MODEL_ID: z.string().min(1).default('eleven_multilingual_v2'),
  ELEVENLABS_OUTPUT_FORMAT: z.string().min(1).default('mp3_44100_128'),
  ELEVENLABS_STT_MODEL_ID: z.string().min(1).default('scribe_v1'),
});

type EnvSchema = z.infer<typeof envSchema>;

export interface AppConfig extends Omit<EnvSchema, 'ENV'> {
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

function loadConfig(): AppConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Variáveis de ambiente inválidas:\n${problems}`);
  }

  const { ENV, ...parsed } = result.data;
  const effectiveNodeEnv = ENV ?? parsed.NODE_ENV;

  return Object.freeze({
    ...parsed,
    NODE_ENV: effectiveNodeEnv,
    isProduction: effectiveNodeEnv === 'production',
    isTest: effectiveNodeEnv === 'test',
  });
}

export const env: AppConfig = loadConfig();
