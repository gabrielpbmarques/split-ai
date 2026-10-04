process.env.NODE_ENV = 'test';
process.env.ENV = 'test';
process.env.INTEGRATION_MODE ??= 'mock';
process.env.LOG_LEVEL ??= 'fatal';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgres://test:test@localhost:5432/split_ai_test';
process.env.JWT_SECRET ??= 'test-secret';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_test';
