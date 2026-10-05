import { randomUUID } from 'crypto';

import { SessionEntity } from 'src/infrastructure/database/schema';
import {
  bearer,
  createAgent,
  createMessage,
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
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);

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

  it('GET /conversation/sessions lists every session with pagination and filters', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);
    const mine = await createSession(t.dataSource, {
      agent_id: agent.id,
      user_id: user.id,
    });
    await createMessage(t.dataSource, {
      session_id: mine.id,
      message: 'primeira',
    });
    const otherAgent = await createAgent(t.dataSource);
    const otherUser = await createUser(t.dataSource);
    const others = await createSession(t.dataSource, {
      agent_id: otherAgent.id,
      user_id: otherUser.id,
    });

    const list = await t
      .http()
      .get('/conversation/sessions')
      .query({ page: 1, limit: 10 })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(list.body.total).toBe(2);

    const filtered = await t
      .http()
      .get('/conversation/sessions')
      .query({ agent_id: agent.id })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(filtered.body.total).toBe(1);
    expect(filtered.body.items[0]).toMatchObject({
      id: mine.id,
      last_message: 'primeira',
    });

    const byUser = await t
      .http()
      .get('/conversation/sessions')
      .query({ user_id: otherUser.id })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(byUser.body.items.map((item: { id: string }) => item.id)).toEqual([
      others.id,
    ]);

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

  it('GET /conversation/sessions/:id/messages returns the session summary and messages', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);
    const session = await createSession(t.dataSource, {
      agent_id: agent.id,
      user_id: user.id,
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
    expect(body.session).not.toHaveProperty('tokens_used');
    expect(body.messages).toHaveLength(2);

    await t
      .http()
      .get(`/conversation/sessions/${randomUUID()}/messages`)
      .set('Authorization', bearer(user))
      .expect(404);

    const guest = await createUser(t.dataSource, { role: 'guest' });
    await t
      .http()
      .get(`/conversation/sessions/${session.id}/messages`)
      .set('Authorization', bearer(guest))
      .expect(403);
  });
});
