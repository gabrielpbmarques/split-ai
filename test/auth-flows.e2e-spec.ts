import { createUser, PASSWORD } from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('auth-flows (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  describe('POST /auth/login', () => {
    it('returns the user summary and a bearer token for valid credentials', async () => {
      const user = await createUser(t.dataSource);

      const { body } = await t
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(200);

      expect(body.user).toMatchObject({
        id: user.id,
        email: user.email,
        role: 'user',
      });
      expect(body.user).not.toHaveProperty('organization_id');
      expect(typeof body.token).toBe('string');

      await t
        .http()
        .get('/profile')
        .set('Authorization', `Bearer ${body.token}`)
        .expect(200);
    });

    it('answers 401 for a wrong password and for an unknown e-mail', async () => {
      const user = await createUser(t.dataSource);

      await t
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: 'errada-123' })
        .expect(401);
      await t
        .http()
        .post('/auth/login')
        .send({ email: 'ninguem@example.test', password: PASSWORD })
        .expect(401);
    });

    it('answers 400 for an inactive account and for an invalid body', async () => {
      const user = await createUser(t.dataSource, { status: 'inactive' });

      await t
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(400);

      const { body } = await t
        .http()
        .post('/auth/login')
        .send({ email: 'not-an-email', password: PASSWORD, extra: 1 })
        .expect(400);

      expect(body.category).toBe('VALIDATION');
      expect(body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      );
    });
  });

  describe('removed self-service sign-up routes', () => {
    it.each([
      '/auth/register-lite',
      '/auth/check-user-registered',
      '/auth/send-sms',
      '/auth/verify-sms',
      '/sign-up',
    ])('POST %s is no longer mounted', async (route) => {
      await t.http().post(route).send({}).expect(404);
    });
  });
});
