import { randomUUID } from 'crypto';

import {
  AgentEntity,
  AgentInstructionEntity,
} from 'src/infrastructure/database/schema';
import { bearer, createAgent, createUser } from 'test/support/factories';
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

  describe('POST /agent/create', () => {
    it('creates the agent with its instructions and owner', async () => {
      const user = await createUser(t.dataSource);

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
        user_id: user.id,
        vector_search_tool: true,
      });

      const stored = await t.dataSource
        .getRepository(AgentInstructionEntity)
        .findOneByOrFail({ agent_id: body.id });
      expect(stored.instructions).toEqual(instructions);
    });

    it('stores the external database connection without exposing the url', async () => {
      const user = await createUser(t.dataSource);

      const { body } = await t
        .http()
        .post('/agent/create')
        .set('Authorization', bearer(user))
        .send({
          name: 'Analista',
          instructions,
          databaseTool: true,
          databaseUrl: 'postgres://reader:secret@db.example.test:5432/loja',
          databaseTables: ['pedidos', 'clientes'],
          databaseSampleRows: 0,
        })
        .expect(201);

      const stored = await t.dataSource
        .getRepository(AgentEntity)
        .createQueryBuilder('a')
        .addSelect('a.database_url')
        .where('a.id = :id', { id: body.id })
        .getOneOrFail();
      expect(stored).toMatchObject({
        database_url: 'postgres://reader:secret@db.example.test:5432/loja',
        database_tables: ['pedidos', 'clientes'],
        database_sample_rows: 0,
      });

      const read = await t
        .http()
        .get(`/agent/${body.id}`)
        .set('Authorization', bearer(user))
        .expect(200);
      expect(JSON.stringify(read.body)).not.toContain('secret');

      await t
        .http()
        .post('/agent/create')
        .set('Authorization', bearer(user))
        .send({ name: 'x', instructions, databaseUrl: 'sqlite://local.db' })
        .expect(400);
    });

    it('validates the body (400), blocks guests (403) and anonymous callers (401)', async () => {
      const user = await createUser(t.dataSource);

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
  });

  describe('GET /agent/:id, GET /agent/list, GET /agent', () => {
    it('reads by id or identifier, including agents created by someone else', async () => {
      const user = await createUser(t.dataSource);
      const agent = await createAgent(t.dataSource, {
        agent_identifier: 'suporte',
      });
      const othersAgent = await createAgent(t.dataSource, {
        user_id: (await createUser(t.dataSource)).id,
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
        .get(`/agent/${othersAgent.id}`)
        .set('Authorization', bearer(user))
        .expect(200);
      await t
        .http()
        .get(`/agent/${randomUUID()}`)
        .set('Authorization', bearer(user))
        .expect(404);
    });

    it('lists every agent with pagination; the full listing is admin only', async () => {
      const user = await createUser(t.dataSource);
      await createAgent(t.dataSource, { name: 'A' });
      await createAgent(t.dataSource, { name: 'B' });
      await createAgent(t.dataSource, { name: 'C' });

      const list = await t
        .http()
        .get('/agent/list')
        .query({ limit: 1 })
        .set('Authorization', bearer(user))
        .expect(200);
      expect(list.body).toMatchObject({ total: 3, totalPages: 3, limit: 1 });
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
    it('updates fields, instructions and the database connection', async () => {
      const user = await createUser(t.dataSource);
      const agent = await createAgent(t.dataSource);

      await t
        .http()
        .patch(`/agent/${agent.id}`)
        .set('Authorization', bearer(user))
        .send({
          name: 'Renomeado',
          temperature: 0.7,
          sites: ['https://example.test'],
          instructions: { ...instructions, objetivo: 'Novo objetivo' },
          databaseTables: ['pedidos'],
        })
        .expect(200);

      const updated = await t.dataSource
        .getRepository(AgentEntity)
        .findOneByOrFail({ id: agent.id });
      expect(updated).toMatchObject({
        name: 'Renomeado',
        temperature: 0.7,
        sites: ['https://example.test'],
        database_tables: ['pedidos'],
      });

      await t
        .http()
        .patch(`/agent/${agent.id}`)
        .set('Authorization', bearer(user))
        .send({ temperature: 'quente' })
        .expect(400);
      await t
        .http()
        .patch(`/agent/${agent.id}`)
        .set('Authorization', bearer(user))
        .send({ organizationId: randomUUID() })
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
      const user = await createUser(t.dataSource);
      const admin = await createUser(t.dataSource, { role: 'admin' });
      const agent = await createAgent(t.dataSource);

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
    it('derives the principal, tool and has-tools flags from the connections', async () => {
      const user = await createUser(t.dataSource);
      const principal = await createAgent(t.dataSource);
      const child = await createAgent(t.dataSource);
      const alone = await createAgent(t.dataSource);

      await t
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

      const list = await t
        .http()
        .get('/agent/list')
        .set('Authorization', bearer(user))
        .expect(200);
      const flagsById = new Map(
        (
          list.body.items as {
            id: string;
            is_tool: boolean;
            is_principal: boolean;
            has_tools: boolean;
          }[]
        ).map(({ id, is_tool, is_principal, has_tools }) => [
          id,
          { is_tool, is_principal, has_tools },
        ]),
      );
      expect(flagsById.get(principal.id)).toEqual({
        is_tool: false,
        is_principal: true,
        has_tools: true,
      });
      expect(flagsById.get(child.id)).toEqual({
        is_tool: true,
        is_principal: false,
        has_tools: false,
      });
      expect(flagsById.get(alone.id)).toEqual({
        is_tool: false,
        is_principal: true,
        has_tools: false,
      });

      const childDetail = await t
        .http()
        .get(`/agent/${child.id}`)
        .set('Authorization', bearer(user))
        .expect(200);
      expect(childDetail.body.data).toMatchObject({
        isTool: true,
        isPrincipal: false,
        hasTools: false,
      });

      const aloneDetail = await t
        .http()
        .get(`/agent/${alone.id}`)
        .set('Authorization', bearer(user))
        .expect(200);
      expect(aloneDetail.body.data).toMatchObject({
        isTool: false,
        isPrincipal: true,
        hasTools: false,
      });
    });

    it('keeps connections one level deep: a tool gets no tools and an agent with tools is no tool (409)', async () => {
      const user = await createUser(t.dataSource);
      const principal = await createAgent(t.dataSource);
      const child = await createAgent(t.dataSource);
      const other = await createAgent(t.dataSource);

      await t
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

      const toolWithTools = await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: child.id,
          childAgentId: other.id,
          toolName: 'consultar_prazos',
          toolDescription: 'Consulta prazos.',
        })
        .expect(409);
      expect(toolWithTools.body.message).toBe(
        'O agente já é ferramenta de outro agente e não pode ter ferramentas próprias.',
      );

      const agentWithToolsAsTool = await t
        .http()
        .post('/agent-connection/create')
        .set('Authorization', bearer(user))
        .send({
          principalAgentId: other.id,
          childAgentId: principal.id,
          toolName: 'atendimento',
          toolDescription: 'Encaminha ao atendimento.',
        })
        .expect(409);
      expect(agentWithToolsAsTool.body.message).toBe(
        'O agente conectado tem ferramentas próprias e não pode ser usado como ferramenta.',
      );
    });

    it('connects two agents, lists, updates, saves layout and deletes', async () => {
      const user = await createUser(t.dataSource);
      const principal = await createAgent(t.dataSource);
      const child = await createAgent(t.dataSource);

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
  });
});
