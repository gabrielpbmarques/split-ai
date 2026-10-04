import { randomUUID } from 'crypto';

import { SourceEntity } from 'src/infrastructure/database/schema';
import {
  bearer,
  createAgent,
  createOrganization,
  createSource,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('sources (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('lists sources of an agent (agent_id required) and reads one within the organization', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });
    const source = await createSource(t.dataSource, {
      agent_id: agent.id,
      organization_id: organization.id,
    });

    const list = await t
      .http()
      .get('/source')
      .query({ agent_id: agent.id })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].id).toBe(source.id);

    await t
      .http()
      .get('/source')
      .set('Authorization', bearer(user))
      .expect(400);

    const one = await t
      .http()
      .get(`/source/${source.id}`)
      .set('Authorization', bearer(user))
      .expect(200);
    expect(one.body.id).toBe(source.id);

    await t
      .http()
      .get(`/source/${randomUUID()}`)
      .set('Authorization', bearer(user))
      .expect(404);

    const outsider = await createUser(t.dataSource, {
      organization_id: (await createOrganization(t.dataSource)).id,
    });
    await t
      .http()
      .get(`/source/${source.id}`)
      .set('Authorization', bearer(outsider))
      .expect(403);
  });

  it('deletes a source (soft) together with its vectors and answers 404 afterwards', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });
    const source = await createSource(t.dataSource, {
      agent_id: agent.id,
      organization_id: organization.id,
    });

    await t
      .http()
      .delete(`/source/${source.id}`)
      .set('Authorization', bearer(user))
      .expect(204);
    await t
      .http()
      .delete(`/source/${source.id}`)
      .set('Authorization', bearer(user))
      .expect(404);

    const row = await t.dataSource
      .getRepository(SourceEntity)
      .findOne({ where: { id: source.id }, withDeleted: true });
    expect(row?.deleted_at).toBeTruthy();
  });

  it('ingests a site through POST /agent/generate-source (admin, multipart) and records the source', async () => {
    const organization = await createOrganization(t.dataSource);
    const admin = await createUser(t.dataSource, { role: 'admin' });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(admin))
      .field('url', 'https://example.test')
      .field('agentId', agent.id)
      .expect(200);

    const sources = await t.dataSource
      .getRepository(SourceEntity)
      .findBy({ agent_id: agent.id });
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({
      source_type: 'site',
      status: 'completed',
    });
    expect(sources[0].chunk_count).toBeGreaterThan(0);

    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(admin))
      .field('agentId', agent.id)
      .expect(400);

    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('url', 'https://example.test')
      .field('agentId', agent.id)
      .expect(403);
  });

  it('ingests an uploaded text file', async () => {
    const organization = await createOrganization(t.dataSource);
    const admin = await createUser(t.dataSource, { role: 'admin' });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(admin))
      .field('agentId', agent.id)
      .attach('file', Buffer.from('Política de troca: 30 dias.'), {
        filename: 'politica.txt',
        contentType: 'text/plain',
      })
      .expect(200);

    const sources = await t.dataSource
      .getRepository(SourceEntity)
      .findBy({ agent_id: agent.id });
    expect(sources).toHaveLength(1);
    expect(sources[0].status).toBe('completed');
  });
});
