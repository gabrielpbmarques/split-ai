import { randomUUID } from 'crypto';

import {
  bearer,
  createAgent,
  createMessage,
  createOrganization,
  createReport,
  createSession,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('reports (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  async function seed() {
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
    const report = await createReport(t.dataSource, {
      session_id: session.id,
      agent_id: agent.id,
      organization_id: organization.id,
      sentiment: 'positive',
      type: 'appointment',
    });
    return { organization, user, agent, session, report };
  }

  it('GET /report lists the organization reports with filters and pagination', async () => {
    const { user, agent } = await seed();
    const other = await createOrganization(t.dataSource);
    const otherAgent = await createAgent(t.dataSource, {
      organization_id: other.id,
    });
    const otherSession = await createSession(t.dataSource, {
      agent_id: otherAgent.id,
      organization_id: other.id,
      user_id: user.id,
    });
    await createReport(t.dataSource, {
      session_id: otherSession.id,
      agent_id: otherAgent.id,
      organization_id: other.id,
      sentiment: 'negative',
    });

    const list = await t
      .http()
      .get('/report')
      .set('Authorization', bearer(user))
      .expect(200);
    expect(list.body.total).toBe(1);

    const filtered = await t
      .http()
      .get('/report')
      .query({ sentiment: 'negative', agent_id: agent.id })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(filtered.body.total).toBe(0);

    await t
      .http()
      .get('/report')
      .query({ sentiment: 'feliz' })
      .set('Authorization', bearer(user))
      .expect(400);

    const admin = await createUser(t.dataSource, { role: 'admin' });
    const all = await t
      .http()
      .get('/report')
      .set('Authorization', bearer(admin))
      .expect(200);
    expect(all.body.total).toBe(2);
  });

  it('GET /report/:id and /report/:id/conversation respect the organization scope', async () => {
    const { user, report } = await seed();

    const one = await t
      .http()
      .get(`/report/${report.id}`)
      .set('Authorization', bearer(user))
      .expect(200);
    expect(one.body.id).toBe(report.id);

    const conversation = await t
      .http()
      .get(`/report/${report.id}/conversation`)
      .set('Authorization', bearer(user))
      .expect(200);
    expect(conversation.body.messages).toHaveLength(2);

    await t
      .http()
      .get(`/report/${randomUUID()}`)
      .set('Authorization', bearer(user))
      .expect(404);

    const outsider = await createUser(t.dataSource, {
      organization_id: (await createOrganization(t.dataSource)).id,
    });
    await t
      .http()
      .get(`/report/${report.id}`)
      .set('Authorization', bearer(outsider))
      .expect(403);

    const guest = await createUser(t.dataSource, { role: 'guest' });
    await t
      .http()
      .get('/report')
      .set('Authorization', bearer(guest))
      .expect(403);
  });

  it('dashboards aggregate statistics, charts and dashboard-data for the organization', async () => {
    const { user } = await seed();

    const statistics = await t
      .http()
      .get('/dashboard/statistics')
      .query({ period: '7days' })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(statistics.body).toMatchObject({
      totalConversations: 1,
      satisfactionRate: 100,
      activeAgents: 1,
    });

    const charts = await t
      .http()
      .get('/dashboard/charts')
      .query({ period: 'today' })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(charts.body.sentiment.datasets[0].data).toEqual([1, 0, 0]);

    const data = await t
      .http()
      .get('/analytics/dashboard-data')
      .set('Authorization', bearer(user))
      .expect(200);
    expect(data.body).toMatchObject({
      totalVolume: 1,
      byType: { appointment: 1, order: 0, faq: 0 },
      bySentiment: { positive: 1, negative: 0, neutral: 0 },
    });

    await t
      .http()
      .get('/analytics/dashboard-data')
      .query({ sentiment: 'feliz' })
      .set('Authorization', bearer(user))
      .expect(400);
    await t
      .http()
      .get('/dashboard/statistics')
      .query({ period: 'custom', startDate: 'ontem' })
      .set('Authorization', bearer(user))
      .expect(400);
  });
});
