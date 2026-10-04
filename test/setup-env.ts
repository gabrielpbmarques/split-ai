process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??=
  'postgres://test:test@localhost:5432/split_ai_test';
process.env.JWT_SECRET ??= 'test-secret';
