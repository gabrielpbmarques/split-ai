import { SmsVerificationEntity } from 'src/infrastructure/database/schema';
import {
  createOrganization,
  createUser,
  PASSWORD,
} from 'test/support/factories';
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
      const organization = await createOrganization(t.dataSource);
      const user = await createUser(t.dataSource, {
        organization_id: organization.id,
        org_role: 'owner',
      });

      const { body } = await t
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(200);

      expect(body.user).toMatchObject({
        id: user.id,
        email: user.email,
        organization_id: organization.id,
      });
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

  describe('POST /auth/register-lite + /auth/check-user-registered', () => {
    it('registers an inactive user and then reports the phone as registered', async () => {
      const phone = '5511987654321';

      const { body } = await t
        .http()
        .post('/auth/register-lite')
        .send({ name: 'Ana', email: 'ana@example.test', phone })
        .expect(201);

      expect(body.data).toMatchObject({ name: 'Ana', phone });

      const check = await t
        .http()
        .post('/auth/check-user-registered')
        .send({ phone })
        .expect(200);

      expect(check.body.data).toMatchObject({
        exists: true,
        userId: body.data.userId,
      });

      await t
        .http()
        .post('/auth/check-user-registered')
        .send({ phone: '5511900000000' })
        .expect(200)
        .expect({ success: true, data: { exists: false } });
    });

    it('rejects a duplicated phone or e-mail with 400', async () => {
      const user = await createUser(t.dataSource);

      await t
        .http()
        .post('/auth/register-lite')
        .send({ name: 'Dup', email: 'outro@example.test', phone: user.phone })
        .expect(400);
      await t
        .http()
        .post('/auth/register-lite')
        .send({ name: 'Dup', email: user.email, phone: '5511911112222' })
        .expect(400);
    });
  });

  describe('POST /auth/send-sms + /auth/verify-sms', () => {
    it('sends a code through the messaging port and verifies it into a token', async () => {
      const user = await createUser(t.dataSource, { phone: '5511977776666' });

      await t
        .http()
        .post('/auth/send-sms')
        .send({ phone: user.phone })
        .expect(200);

      const verification = await t.dataSource
        .getRepository(SmsVerificationEntity)
        .findOneByOrFail({ phone: user.phone });

      const { body } = await t
        .http()
        .post('/auth/verify-sms')
        .send({ phone: user.phone, code: verification.code })
        .expect(200);

      expect(body).toMatchObject({ success: true, user_id: user.id });
      expect(typeof body.token).toBe('string');
    });

    it('creates a guest when a visitor verifies a phone that is not registered', async () => {
      await t
        .http()
        .post('/auth/send-sms')
        .send({ phone: '5511955554444', isGuest: true, name: 'Visitante' })
        .expect(200);

      const verification = await t.dataSource
        .getRepository(SmsVerificationEntity)
        .findOneByOrFail({ phone: '5511955554444' });

      const { body } = await t
        .http()
        .post('/auth/verify-sms')
        .send({ phone: '5511955554444', code: verification.code, name: 'Vi' })
        .expect(200);

      expect(body.success).toBe(true);

      const profile = await t
        .http()
        .get('/profile')
        .set('Authorization', `Bearer ${body.token}`)
        .expect(200);

      expect(profile.body).toMatchObject({ role: 'guest' });
    });

    it('answers 400 for an unknown phone, a wrong code and a malformed code', async () => {
      await t
        .http()
        .post('/auth/send-sms')
        .send({ phone: '5511933332222' })
        .expect(400);
      await t
        .http()
        .post('/auth/verify-sms')
        .send({ phone: '5511933332222', code: '000000' })
        .expect(400);
      await t
        .http()
        .post('/auth/verify-sms')
        .send({ phone: '5511933332222', code: '12' })
        .expect(400);
    });
  });

  describe('POST /sign-up', () => {
    it('creates an active user and rejects a reused e-mail with 409', async () => {
      const organization = await createOrganization(t.dataSource);
      const payload = {
        name: 'Novo',
        email: 'novo@example.test',
        phone: '5511944443333',
        organization: organization.id,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      };

      const { body } = await t
        .http()
        .post('/sign-up')
        .send(payload)
        .expect(201);

      expect(body.user).toMatchObject({ email: payload.email, role: 'user' });

      await t.http().post('/sign-up').send(payload).expect(409);
      await t
        .http()
        .post('/sign-up')
        .send({ ...payload, email: 'x@example.test', confirmPassword: 'outra' })
        .expect(400);
    });
  });
});
