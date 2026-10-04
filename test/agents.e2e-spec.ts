import { randomUUID } from 'crypto';

import {
  AgentEntity,
  AgentInstructionEntity,
} from 'src/infrastructure/database/schema';
import {
  bearer,
  createAgent,
  createAgentConnection,
  createOrganization,
  createPlan,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

const instructions = {
  context: 'Atende clientes de uma loja.',
  objetivo: 'Responder dúvidas.',
  diretrizes: ['Seja cordial.'],
};

describe('agents (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  async function staffInOrganization(role: 'user' | 'admin' = 'user') {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
      role,
    });
    return { organization, user };
  }

  describe('POST /agent/create', () => {
    it('creates the agent with its instructions scoped to the user organization', async () => {
      const { organization, user } = await staffInOrganization();

      const { body } = await t
        .http()
        .post('/agent/create')
        .set('Authorization', bearer(user))
        .send({ name: 'Vendas', agentIdentifier: 'vendas', instructions })
        .expect(201);

      const agent = await t.dataSource
        .getRepository(AgentEntity)
        .findOneByOrFail({ id: body.id });
      expect(agent).toMatchObject({
        name: 'Vendas',
        agent_identifier: 'vendas',
        organization_id: organization.id,
        vector_search_tool: true,
      });

      const stored = await t.dataSource
        .getRepository(AgentInstructionEntity)
        .findOneByOrFail({ agent_id: body.id });
      expect(stored.instructions).toEqual(instructions);
    });

    it('enforces the plan max_agents quota (403), validates the body (400) and blocks guests (403)', async () => {
      const plan = await createPlan(t.dataSource, { max_agents: 1 });
      const organization = await createOrganization(t.dataSource, { plan });
      const user = await createUser(t.dataSource, {
        organization_id: organization.id,
      });
      await createAgent(t.dataSource, { organization_id: organization.id });

      await t
        .http()
        .post('/agent/create')
        .set('Authorization', bearer(user))
        .send({ name: 'Segundo', instructions })
        .expect(403);
      await t
        .http()
        .post('/agent/create')
        .set('Authorization', bearer(user))
        .send({ instructions })
        .expect(400);

      const guest = await createUser(t.dataSource, { role: 'guest' });
      await t
        .http()
        .post('/agent/create')
        .set('Authorization', bearer(guest))
        .send({ name: 'x', instructions })
        .expect(403);
      await t
        .http()
        .post('/agent/create')
        .send({ name: 'x', instructions })
        .expect(401);
    });

    it('creates an attendant agent with the default directives merged in', async () => {
      const { user } = await staffInOrganization();

      const { body } = await t
        .http()
        .post('/agent/create/attendant')
        .set('Authorization', bearer(user))
        .send({
          name: 'Atendente',
          instructions: { diretrizes: ['Fale em português.'] },
        })
        .expect(201);

      const stored = await t.dataSource
        .getRepository(AgentInstructionEntity)
        .findOneByOrFail({ agent_id: body.id });
      expect(stored.instructions.diretrizes).toEqual(
        expect.arrayContaining(['Fale em português.']),
      );
      expect(stored.instructions.context).toBeTruthy();
    });
  });

  describe('GET /agent/:id, GET /agent/list, GET /agent', () => {
    it('reads by id or identifier within the organization and refuses other organizations', async () => {
      const { organization, user } = await staffInOrganization();
      const agent = await createAgent(t.dataSource, {
        organization_id: organization.id,
        agent_identifier: 'suporte',
      });
      const foreign = await createAgent(t.dataSource, {
        organization_id: (await createOrganization(t.dataSource)).id,
      });

      const byId = await t
        .http()
        .get(`/agent/${agent.id}`)
        .set('Authorization', bearer(user))
        .expect(200);
      expect(byId.body.data).toMatchObject({
        id: agent.id,
        agentIdentifier: 'suporte',
      });

      const byIdentifier = await t
        .http()
        .get('/agent/suporte')
        .set('Authorization', bearer(user))
        .expect(200);
      expect(byIdentifier.body.data.id).toBe(agent.id);

      await t
        .http()
        .get(`/agent/${foreign.id}`)
        .set('Authorization', bearer(user))
        .expect(403);
      await t
        .http()
        .get(`/agent/${randomUUID()}`)
        .set('Authorization', bearer(user))
        .expect(404);
    });

    it('lists only the organization agents with pagination; admins list everything', async () => {
      const { organization, user } = await staffInOrganization();
      await createAgent(t.dataSource, {
        organization_id: organization.id,
        name: 'A',
      });
      await createAgent(t.dataSource, {
        organization_id: organization.id,
        name: 'B',
      });
      await createAgent(t.dataSource, {
        organization_id: (await createOrganization(t.dataSource)).id,
        name: 'C',
      });

      const list = await t
        .http()
        .get('/agent/list')
        .query({ limit: 1 })
        .set('Authorization', bearer(user))
        .expect(200);
      expect(list.body).toMatchObject({ total: 2, totalPages: 2, limit: 1 });
      expect(list.body.items[0]).toHaveProperty('is_tool');

      await t
        .http()
        .get('/agent')
        .set('Authorization', bearer(user))
        .expect(403);

      const admin = await createUser(t.dataSource, { role: 'admin' });
      const all = await t
        .http()
        .get('/agent')
        .set('Authorization', bearer(admin))
        .expect(200);
      expect(all.body.total).toBe(3);
    });
  });

  describe('PATCH /agent/:id', () => {
    it('updates fields and instructions, keeps the organization for non-admins', async () => {
      const { organization, user } = await staffInOrganization();
      const agent = await createAgent(t.dataSource, {
        organization_id: organization.id,
      });

      await t
        .http()
        .patch(`/agent/${agent.id}`)
        .set('Authorization', bearer(user))
        .send({
          name: 'Renomeado',
          temperature: 0.7,
          sites: ['https://example.test'],
          instructions: { ...instructions, objetivo: 'Novo objetivo' },
          organizationId: randomUUID(),
        })
        .expect(200);

      const updated = await t.dataSource
        .getRepository(AgentEntity)
        .findOneByOrFail({ id: agent.id });
      expect(updated).toMatchObject({
        name: 'Renomeado',
        temperature: 0.7,
        sites: ['https://example.test'],
        organization_id: organization.id,
      });

      await t
        .http()
        .patch(`/agent/${agent.id}`)
        .set('Authorization', bearer(user))
        .send({ temperature: 'quente' })
        .expect(400);
      await t
        .http()
        .patch(`/agent/${randomUUID()}`)
        .set('Authorization', bearer(user))
        .send({ name: 'x' })
        .expect(404);
    });
  });

  describe('POST /agent/load-sites', () => {
    it('crawls through the mocked site crawler and indexes into the mocked vector store (admin only)', async () => {
      const { organization, user } = await staffInOrganization();
      const admin = await createUser(t.dataSource, { role: 'admin' });
      const agent = await createAgent(t.dataSource, {
        organization_id: organization.id,
      });

      await t
        .http()
        .post('/agent/load-sites')
        .set('Authorization', bearer(admin))
        .send({ sites: 'https://example.test', agentId: agent.id })
        .expect(200);
      await t
        .http()
        .post('/agent/load-sites')
        .set('Authorization', bearer(user))
        .send({ sites: 'https://example.test', agentId: agent.id })
        .expect(403);
    });
  });

  describe('agent connections', () => {
    it('connects two agents of the same organization, lists, updates, saves layout and deletes', async () => {
      const { organization, user } = await staffInOrganization();
      const principal = await createAgent(t.dataSource, {
        organization_id: organization.id,
      });
      const child = await createAgent(t.dataSource, {
        organization_id: organization.id,
      });

      const created = await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: principal.id,
          childAgentId: child.id,
          toolName: 'consultar_estoque',
          toolDescription: 'Consulta o estoque.',
        })
        .expect(201);

      await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: principal.id,
          childAgentId: child.id,
          toolName: 'outro',
          toolDescription: 'Duplicada.',
        })
        .expect(409);
      await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: principal.id,
          childAgentId: principal.id,
          toolName: 'self',
          toolDescription: 'x',
        })
        .expect(400);
      await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: principal.id,
          childAgentId: child.id,
          toolName: 'nome inválido!',
          toolDescription: 'x',
        })
        .expect(400);

      const listed = await t
        .http()
        .post('/agent-connection/list')
        .set('Authorization', bearer(user))
        .send({ principalAgentId: principal.id })
        .expect(200);
      expect(JSON.stringify(listed.body)).toContain(created.body.id);

      await t
        .http()
        .post('/agent-connection/update')
        .set('Authorization', bearer(user))
        .send({
          id: created.body.id,
          enabled: false,
          toolDescription: 'Atualizada.',
        })
        .expect(200);

      await t
        .http()
        .post('/agent-connection/layout')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: principal.id,
          layout: { viewport: { zoom: 1, x: 0, y: 0 }, nodes: {} },
        })
        .expect(200);

      const agentRow = await t.dataSource
        .getRepository(AgentEntity)
        .findOneByOrFail({ id: principal.id });
      expect(agentRow.canvas_layout).toMatchObject({ viewport: { zoom: 1 } });

      await t
        .http()
        .post('/agent-connection/delete')
        .set('Authorization', bearer(user))
        .send({ id: created.body.id })
        .expect(204);
      await t
        .http()
        .post('/agent-connection/delete')
        .set('Authorization', bearer(user))
        .send({ id: created.body.id })
        .expect(404);
    });

    it('refuses connecting agents of different organizations and hides foreign connections', async () => {
      const { organization, user } = await staffInOrganization();
      const principal = await createAgent(t.dataSource, {
        organization_id: organization.id,
      });
      const other = await createOrganization(t.dataSource);
      const foreignChild = await createAgent(t.dataSource, {
        organization_id: other.id,
      });
      const foreignPrincipal = await createAgent(t.dataSource, {
        organization_id: other.id,
      });
      const foreign = await createAgentConnection(t.dataSource, {
        organization_id: other.id,
        principal_agent_id: foreignPrincipal.id,
        child_agent_id: foreignChild.id,
      });

      await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: principal.id,
          childAgentId: foreignChild.id,
          toolName: 'x',
          toolDescription: 'x',
        })
        .expect(403);
      await t
        .http()
        .post('/agent-connection/delete')
        .set('Authorization', bearer(user))
        .send({ id: foreign.id })
        .expect(404);
    });
  });
});
