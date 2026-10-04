import { randomUUID } from 'crypto';

import { SessionEntity } from 'src/infrastructure/database/schema';
import {
  bearer,
  createAgent,
  createMessage,
  createOrganization,
  createSession,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('sessions (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('POST /session creates a session for the user and agent and reuses the active one', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/session')
      .set('Authorization', bearer(user))
      .send({ agent_id: agent.id })
      .expect(200);
    await t
      .http()
      .post('/session')
      .set('Authorization', bearer(user))
      .send({ agent_id: agent.id })
      .expect(200);

    const sessions = await t.dataSource
      .getRepository(SessionEntity)
      .findBy({ user_id: user.id, agent_id: agent.id });
    expect(sessions).toHaveLength(1);

    await t
      .http()
      .post('/session')
      .set('Authorization', bearer(user))
      .send({})
      .expect(400);
    await t.http().post('/session').send({ agent_id: agent.id }).expect(401);
  });

  it('GET /conversation/sessions lists the organization sessions with pagination and filters', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });
    const mine = await createSession(t.dataSource, {
      agent_id: agent.id,
      user_id: user.id,
      organization_id: organization.id,
    });
    await createMessage(t.dataSource, {
      session_id: mine.id,
      message: 'primeira',
    });
    const other = await createOrganization(t.dataSource);
    const otherAgent = await createAgent(t.dataSource, {
      organization_id: other.id,
    });
    await createSession(t.dataSource, {
      agent_id: otherAgent.id,
      user_id: user.id,
      organization_id: other.id,
    });

    const list = await t
      .http()
      .get('/conversation/sessions')
      .query({ page: 1, limit: 10 })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].id).toBe(mine.id);

    const filtered = await t
      .http()
      .get('/conversation/sessions')
      .query({ agent_id: otherAgent.id })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(filtered.body.total).toBe(0);

    await t
      .http()
      .get('/conversation/sessions')
      .query({ start_date: 'ontem' })
      .set('Authorization', bearer(user))
      .expect(400);

    const guest = await createUser(t.dataSource, { role: 'guest' });
    await t
      .http()
      .get('/conversation/sessions')
      .set('Authorization', bearer(guest))
      .expect(403);
  });

  it('GET /conversation/sessions/:id/messages returns the session summary and messages within scope', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });
    const session = await createSession(t.dataSource, {
      agent_id: agent.id,
      user_id: user.id,
      organization_id: organization.id,
    });
    await createMessage(t.dataSource, {
      session_id: session.id,
      from: 'user',
      message: 'oi',
    });
    await createMessage(t.dataSource, {
      session_id: session.id,
      from: 'agent',
      message: 'olá',
    });

    const { body } = await t
      .http()
      .get(`/conversation/sessions/${session.id}/messages`)
      .set('Authorization', bearer(user))
      .expect(200);
    expect(body.session).toMatchObject({
      id: session.id,
      agent_name: agent.name,
    });
    expect(body.messages).toHaveLength(2);

    await t
      .http()
      .get(`/conversation/sessions/${randomUUID()}/messages`)
      .set('Authorization', bearer(user))
      .expect(404);

    const outsider = await createUser(t.dataSource, {
      organization_id: (await createOrganization(t.dataSource)).id,
    });
    await t
      .http()
      .get(`/conversation/sessions/${session.id}/messages`)
      .set('Authorization', bearer(outsider))
      .expect(403);
  });
});
