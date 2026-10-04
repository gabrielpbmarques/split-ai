import { randomUUID } from 'crypto';

import {
  CreditBalanceEntity,
  UserEntity,
} from 'src/infrastructure/database/schema';
import { PlanType } from 'src/infrastructure/database/schema/plan.entity';
import {
  bearer,
  createOrganization,
  createPlan,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('organizations (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  const organizationPayload = {
    name: 'Acme',
    acronym: 'ACM',
    email_domain: 'acme.test',
    contact_name: 'Contato',
    contact_email: 'contato@acme.test',
    created_by: 'tests',
  };

  describe('POST /organization', () => {
    it('creates the organization, makes the creator its owner and grants the plan credits', async () => {
      await createPlan(t.dataSource, {
        type: PlanType.FREE,
        monthly_credits: 50,
      });
      const admin = await createUser(t.dataSource, { role: 'admin' });

      const { body } = await t
        .http()
        .post('/organization')
        .set('Authorization', bearer(admin))
        .send({ ...organizationPayload, plan: PlanType.FREE })
        .expect(201);

      expect(body).toMatchObject({ name: 'Acme', status: 'active' });

      const owner = await t.dataSource
        .getRepository(UserEntity)
        .findOneByOrFail({ id: admin.id });
      expect(owner).toMatchObject({
        organization_id: body.id,
        org_role: 'owner',
      });

      const balance = await t.dataSource
        .getRepository(CreditBalanceEntity)
        .findOneByOrFail({ organization_id: body.id });
      expect(Number(balance.available_credits)).toBe(50);
    });

    it('answers 400 when the plan does not exist and when the body is invalid', async () => {
      const admin = await createUser(t.dataSource, { role: 'admin' });

      await t
        .http()
        .post('/organization')
        .set('Authorization', bearer(admin))
        .send({ ...organizationPayload, plan: PlanType.SCALE })
        .expect(400);
      await t
        .http()
        .post('/organization')
        .set('Authorization', bearer(admin))
        .send({ name: 'sem os demais campos' })
        .expect(400);
    });

    it('answers 401 without token and 403 for a non-admin', async () => {
      const user = await createUser(t.dataSource);

      await t
        .http()
        .post('/organization')
        .send(organizationPayload)
        .expect(401);
      await t
        .http()
        .post('/organization')
        .set('Authorization', bearer(user))
        .send(organizationPayload)
        .expect(403);
    });
  });

  describe('GET /organization and GET /organization/:id', () => {
    it('lists with pagination for an admin and reads one by id for staff', async () => {
      const admin = await createUser(t.dataSource, { role: 'admin' });
      const first = await createOrganization(t.dataSource, { name: 'Alpha' });
      await createOrganization(t.dataSource, { name: 'Beta' });

      const list = await t
        .http()
        .get('/organization')
        .query({ page: 1, limit: 1 })
        .set('Authorization', bearer(admin))
        .expect(200);

      expect(list.body).toMatchObject({
        total: 2,
        totalPages: 2,
        page: 1,
        limit: 1,
      });
      expect(list.body.items).toHaveLength(1);

      const filtered = await t
        .http()
        .get('/organization')
        .query({ name: 'Alpha' })
        .set('Authorization', bearer(admin))
        .expect(200);
      expect(filtered.body.items.map((o: { name: string }) => o.name)).toEqual([
        'Alpha',
      ]);

      const staff = await createUser(t.dataSource, {
        organization_id: first.id,
      });
      const one = await t
        .http()
        .get(`/organization/${first.id}`)
        .set('Authorization', bearer(staff))
        .expect(200);
      expect(one.body).toMatchObject({ id: first.id, name: 'Alpha' });

      await t
        .http()
        .get(`/organization/${randomUUID()}`)
        .set('Authorization', bearer(staff))
        .expect(404);
      await t
        .http()
        .get('/organization')
        .set('Authorization', bearer(staff))
        .expect(403);
    });
  });

  describe('embed settings', () => {
    it('reads, updates and regenerates the embed token for an admin', async () => {
      const admin = await createUser(t.dataSource, { role: 'admin' });
      const organization = await createOrganization(t.dataSource);

      const before = await t
        .http()
        .get(`/organization/${organization.id}/embed-settings`)
        .set('Authorization', bearer(admin))
        .expect(200);
      expect(before.body).toMatchObject({ chat_embed_enabled: false });

      const updated = await t
        .http()
        .patch(`/organization/${organization.id}/embed-settings`)
        .set('Authorization', bearer(admin))
        .send({ chat_embed_enabled: true, chat_embed_primary_color: '#123abc' })
        .expect(200);
      expect(updated.body).toMatchObject({
        id: organization.id,
        chat_embed_enabled: true,
        chat_embed_primary_color: '#123abc',
      });

      await t
        .http()
        .patch(`/organization/${organization.id}/embed-settings`)
        .set('Authorization', bearer(admin))
        .send({ chat_embed_primary_color: 'vermelho' })
        .expect(400);

      const regenerated = await t
        .http()
        .post(`/organization/${organization.id}/embed/regenerate-token`)
        .set('Authorization', bearer(admin))
        .expect(200);
      expect(typeof regenerated.body.chat_embed_token).toBe('string');

      await t
        .http()
        .get(`/organization/${randomUUID()}/embed-settings`)
        .set('Authorization', bearer(admin))
        .expect(404);
    });

    it('serves the public widget page and script without auth', async () => {
      await t.http().get('/public/embed/chat.js').expect(200);
      const page = await t.http().get('/public/embed/chat').expect(200);
      expect(page.text).toContain('<!doctype html>');
    });
  });
});
