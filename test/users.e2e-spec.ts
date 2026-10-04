import { randomUUID } from 'crypto';

import { UserEntity } from 'src/infrastructure/database/schema';
import {
  bearer,
  createOrganization,
  createUser,
  PASSWORD,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('users (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('POST /user creates a user (admin only) and refuses duplicated e-mail or phone with 409', async () => {
    const admin = await createUser(t.dataSource, { role: 'admin' });
    const organization = await createOrganization(t.dataSource);
    const payload = {
      name: 'Criado',
      email: 'criado@example.test',
      phone: '5511912345678',
      password: PASSWORD,
      organization_id: organization.id,
    };

    const { body } = await t
      .http()
      .post('/user')
      .set('Authorization', bearer(admin))
      .send(payload)
      .expect(201);
    expect(body).toMatchObject({ email: payload.email });
    expect(body).not.toHaveProperty('password_hash');

    await t
      .http()
      .post('/user')
      .set('Authorization', bearer(admin))
      .send(payload)
      .expect(409);
    await t
      .http()
      .post('/user')
      .set('Authorization', bearer(admin))
      .send({ ...payload, email: 'outro@example.test' })
      .expect(409);
    await t
      .http()
      .post('/user')
      .set('Authorization', bearer(admin))
      .send({
        ...payload,
        email: 'x@example.test',
        phone: '5511900000001',
        password: '123',
      })
      .expect(400);

    const staff = await createUser(t.dataSource);
    await t
      .http()
      .post('/user')
      .set('Authorization', bearer(staff))
      .send(payload)
      .expect(403);
  });

  it('GET /user/:id, GET /user and PATCH /user/:id follow the staff/admin split', async () => {
    const admin = await createUser(t.dataSource, { role: 'admin' });
    const staff = await createUser(t.dataSource);
    const target = await createUser(t.dataSource, { name: 'Alvo' });

    const one = await t
      .http()
      .get(`/user/${target.id}`)
      .set('Authorization', bearer(staff))
      .expect(200);
    expect(one.body).toMatchObject({ id: target.id, name: 'Alvo' });
    expect(one.body).not.toHaveProperty('password_hash');
    await t
      .http()
      .get(`/user/${randomUUID()}`)
      .set('Authorization', bearer(staff))
      .expect(404);

    await t.http().get('/user').set('Authorization', bearer(staff)).expect(403);
    const list = await t
      .http()
      .get('/user')
      .query({ limit: 2 })
      .set('Authorization', bearer(admin))
      .expect(200);
    expect(list.body).toMatchObject({ total: 3, limit: 2, totalPages: 2 });

    await t
      .http()
      .patch(`/user/${target.id}`)
      .set('Authorization', bearer(admin))
      .send({ name: 'Renomeado', status: 'inactive' })
      .expect(200);
    const updated = await t.dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ id: target.id });
    expect(updated).toMatchObject({ name: 'Renomeado', status: 'inactive' });

    await t
      .http()
      .patch(`/user/${target.id}`)
      .set('Authorization', bearer(admin))
      .send({ status: 'dormindo' })
      .expect(400);
    await t
      .http()
      .patch(`/user/${randomUUID()}`)
      .set('Authorization', bearer(admin))
      .send({ name: 'x' })
      .expect(404);
    await t
      .http()
      .patch(`/user/${target.id}`)
      .set('Authorization', bearer(staff))
      .send({ name: 'x' })
      .expect(403);
  });

  it('GET /profile and PATCH /profile act on the authenticated user', async () => {
    const user = await createUser(t.dataSource);
    const other = await createUser(t.dataSource);

    const profile = await t
      .http()
      .get('/profile')
      .set('Authorization', bearer(user))
      .expect(200);
    expect(profile.body).toMatchObject({ id: user.id, email: user.email });

    await t
      .http()
      .patch('/profile')
      .set('Authorization', bearer(user))
      .send({ name: 'Eu mesmo' })
      .expect(200);
    const updated = await t.dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ id: user.id });
    expect(updated.name).toBe('Eu mesmo');

    await t
      .http()
      .patch('/profile')
      .set('Authorization', bearer(user))
      .send({ email: other.email })
      .expect(409);
    await t
      .http()
      .patch('/profile')
      .set('Authorization', bearer(user))
      .send({ email: 'invalido' })
      .expect(400);
    await t.http().get('/profile').expect(401);
  });
});
