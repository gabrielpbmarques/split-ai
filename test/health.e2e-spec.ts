import { createTestApp, type TestApp } from 'test/support/test-app';

describe('health (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  it('GET /health/live answers 200 without auth', async () => {
    await t.http().get('/health/live').expect(200);
  });

  it('GET /health/ready reports database, memory and every integration in mock state', async () => {
    const { body } = await t.http().get('/health/ready').expect(200);

    expect(body.status).toBe('ok');
    expect(body.checks.database.status).toBe('up');
    expect(Object.values(body.checks.integrations)).toEqual(
      expect.arrayContaining(['MOCK']),
    );
    expect(new Set(Object.values(body.checks.integrations))).toEqual(
      new Set(['MOCK']),
    );
  });

  it('GET /health/startup answers 200 once every migration is marked as applied', async () => {
    const { body } = await t.http().get('/health/startup').expect(200);

    expect(body.checks.migrations.status).toBe('up');
  });

  it('answers 401 as ErrorResponse for a private route without token', async () => {
    const { body } = await t.http().get('/agent/list').expect(401);

    expect(body).toMatchObject({ status: 401, category: 'UNAUTHENTICATED' });
  });
});
