import { randomUUID } from 'crypto';

import {
  bearer,
  createApiKey,
  createOrganization,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('api-keys (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('creates a key whose secret authenticates as a service principal limited to chat.ask', async () => {
    const organization = await createOrganization(t.dataSource);
    const owner = await createUser(t.dataSource, {
      organization_id: organization.id,
      org_role: 'owner',
    });

    const created = await t
      .http()
      .post('/api-key/create')
      .set('Authorization', bearer(owner))
      .send({ name: 'integração', expiresInDays: 30 })
      .expect(201);

    expect(created.body).toMatchObject({ name: 'integração' });
    expect(created.body.secret).toMatch(/^sk_live_/);
    expect(created.body.key_prefix).toMatch(/^sk_live_/);
    expect(created.body.expires_at).toBeTruthy();

    const list = await t
      .http()
      .post('/api-key/list')
      .set('Authorization', bearer(owner))
      .send({})
      .expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).not.toHaveProperty('key_hash');
    expect(list.body.items[0]).not.toHaveProperty('secret');

    await t
      .http()
      .get('/profile')
      .set('Authorization', `ApiKey ${created.body.secret}`)
      .expect(403);
    await t
      .http()
      .get('/agent/list')
      .set('Authorization', `ApiKey ${created.body.secret}`)
      .expect(403);
  });

  it('revokes a key so it stops authenticating; unknown ids answer 404', async () => {
    const organization = await createOrganization(t.dataSource);
    const owner = await createUser(t.dataSource, {
      organization_id: organization.id,
      org_role: 'owner',
    });
    const { apiKey, secret } = await createApiKey(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/support/question')
      .set('Authorization', `ApiKey ${secret}`)
      .send({})
      .expect(400);

    await t
      .http()
      .post('/api-key/revoke')
      .set('Authorization', bearer(owner))
      .send({ id: apiKey.id })
      .expect(200)
      .expect({ id: apiKey.id, revoked: true });

    await t
      .http()
      .post('/support/question')
      .set('Authorization', `ApiKey ${secret}`)
      .send({})
      .expect(401);
    await t
      .http()
      .post('/api-key/revoke')
      .set('Authorization', bearer(owner))
      .send({ id: randomUUID() })
      .expect(404);
  });

  it('answers 400 for an invalid body, 403 for plain members and 401 without token', async () => {
    const organization = await createOrganization(t.dataSource);
    const owner = await createUser(t.dataSource, {
      organization_id: organization.id,
      org_role: 'owner',
    });
    const member = await createUser(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/api-key/create')
      .set('Authorization', bearer(owner))
      .send({ name: '', expiresInDays: -1 })
      .expect(400);
    await t
      .http()
      .post('/api-key/create')
      .set('Authorization', bearer(member))
      .send({ name: 'x' })
      .expect(403);
    await t.http().post('/api-key/list').send({}).expect(401);
  });
});
