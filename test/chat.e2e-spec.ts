import {
  MessageEntity,
  SessionEntity,
} from 'src/infrastructure/database/schema';
import type { StreamEvent } from 'src/shared/contracts';
import {
  bearer,
  createAgent,
  createApiKey,
  createOrganization,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

function parseNdjson(text: string): StreamEvent[] {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as StreamEvent);
}

describe('chat (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('POST /support/question streams NDJSON events from the mocked model and persists both messages', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });

    const res = await t
      .http()
      .post('/support/question')
      .set('Authorization', bearer(user))
      .send({ question: 'Olá, tudo bem?', agentId: agent.id })
      .expect(200);

    expect(res.headers['content-type']).toContain('application/x-ndjson');

    const events = parseNdjson(res.text);
    expect(events.at(-1)).toEqual({ type: 'done' });
    expect(events.some((event) => event.type === 'final')).toBe(true);

    const session = await t.dataSource
      .getRepository(SessionEntity)
      .findOneByOrFail({ agent_id: agent.id, user_id: user.id });
    const messages = await t.dataSource
      .getRepository(MessageEntity)
      .findBy({ session_id: session.id });
    expect(messages.map((m) => m.from).sort()).toEqual(['agent', 'user']);
  });

  it('accepts an API key as a service principal and refuses inactive organizations', async () => {
    const organization = await createOrganization(t.dataSource);
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });
    const { secret } = await createApiKey(t.dataSource, {
      organization_id: organization.id,
    });

    const res = await t
      .http()
      .post('/support/question')
      .set('Authorization', `ApiKey ${secret}`)
      .send({ question: 'Qual o horário?', agentId: agent.id })
      .expect(200);
    expect(parseNdjson(res.text).at(-1)).toEqual({ type: 'done' });

    const inactive = await createOrganization(t.dataSource, {
      status: 'inactive',
    });
    const blocked = await createUser(t.dataSource, {
      organization_id: inactive.id,
    });
    await t
      .http()
      .post('/support/question')
      .set('Authorization', bearer(blocked))
      .send({ question: 'x', agentId: agent.id })
      .expect(403);
  });

  it('validates the body (400) and requires a token (401)', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/support/question')
      .set('Authorization', bearer(user))
      .send({ question: '' })
      .expect(400);
    await t
      .http()
      .post('/support/question')
      .send({ question: 'x', agentId: 'y' })
      .expect(401);
  });

  it('writes an error event instead of a 500 when the agent does not exist', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });

    const res = await t
      .http()
      .post('/support/question')
      .set('Authorization', bearer(user))
      .send({ question: 'x', agentId: 'inexistente' })
      .expect(200);

    const events = parseNdjson(res.text);
    expect(events.some((event) => event.type === 'error')).toBe(true);
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('POST /chat/attendant answers synchronously for an organization user', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    const agent = await createAgent(t.dataSource, {
      organization_id: organization.id,
    });

    const res = await t
      .http()
      .post('/chat/attendant')
      .set('Authorization', bearer(user))
      .send({ question: 'Quero agendar.', agentId: agent.id })
      .expect(200);

    expect(res.text.length).toBeGreaterThan(0);
  });
});
