import { randomUUID } from 'crypto';

import { SourceEntity } from 'src/infrastructure/database/schema';
import {
  VECTOR_STORE,
  type VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import { LoadVectorSearchToolService } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service';
import {
  bearer,
  createAgent,
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
  afterEach(() => jest.restoreAllMocks());
  afterAll(() => t.close());

  const ACCEPTED = {
    message:
      'Fonte de conhecimento recebida. O processamento continua em segundo plano.',
  };

  const pause = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function waitUntil(condition: () => Promise<boolean>): Promise<void> {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await condition()) {
        return;
      }
      await pause(50);
    }

    throw new Error('A condição não foi atingida a tempo');
  }

  async function settledSources(agentId: string): Promise<SourceEntity[]> {
    const repository = t.dataSource.getRepository(SourceEntity);

    await waitUntil(async () => {
      const sources = await repository.findBy({ agent_id: agentId });
      return (
        sources.length > 0 &&
        sources.every((source) => source.status !== 'processing')
      );
    });

    return repository.findBy({ agent_id: agentId });
  }

  async function searchAs(agentId: string, query: string): Promise<string> {
    const tool = await t.app.get(LoadVectorSearchToolService).execute(agentId);
    return tool.invoke({ query });
  }

  it('lists sources of an agent (agent_id required) and reads one', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);
    const source = await createSource(t.dataSource, {
      agent_id: agent.id,
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

    const guest = await createUser(t.dataSource, { role: 'guest' });
    await t
      .http()
      .get(`/source/${source.id}`)
      .set('Authorization', bearer(guest))
      .expect(403);
  });

  it('deletes a source (soft) together with its vectors and answers 404 afterwards', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);
    const source = await createSource(t.dataSource, {
      agent_id: agent.id,
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

  it('accepts a site through POST /agent/generate-source (multipart) with 202 and indexes it in the background', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);

    const accepted = await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('url', 'https://example.test')
      .field('agentId', agent.id)
      .expect(202);
    expect(accepted.body).toEqual(ACCEPTED);

    const sources = await settledSources(agent.id);
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({
      source_type: 'site',
      status: 'completed',
    });
    expect(sources[0].chunk_count).toBeGreaterThan(0);

    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('agentId', agent.id)
      .expect(400);

    const guest = await createUser(t.dataSource, { role: 'guest' });
    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(guest))
      .field('url', 'https://example.test')
      .field('agentId', agent.id)
      .expect(403);
  });

  it('indexes an uploaded text file without a source type and the agent search finds it, scoped to that agent', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);
    const otherAgent = await createAgent(t.dataSource, {
      agent_identifier: 'outro-agente',
    });

    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('agentId', agent.id)
      .attach('file', Buffer.from('Política de troca: 30 dias.'), {
        filename: 'politica.txt',
        contentType: 'text/plain',
      })
      .expect(202);
    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('agentId', 'outro-agente')
      .attach('file', Buffer.from('Política de troca: 7 dias.'), {
        filename: 'outra-politica.md',
        contentType: 'text/markdown',
      })
      .expect(202);

    const [source] = await settledSources(agent.id);
    expect(source).toMatchObject({
      status: 'completed',
      file_name: 'politica.txt',
    });
    await settledSources(otherAgent.id);

    const found = await searchAs(agent.id, 'troca');
    expect(found).toContain('30 dias');
    expect(found).not.toContain('7 dias');
  });

  it('refuses an unsupported file type (400) and an unknown agent (404) without creating sources', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);

    const unsupported = await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('agentId', agent.id)
      .attach('file', Buffer.from('MZ'), {
        filename: 'programa.exe',
        contentType: 'application/octet-stream',
      })
      .expect(400);
    expect(unsupported.body.message).toContain('Tipo de arquivo não suportado');

    for (const agentId of ['agente-inexistente', randomUUID()]) {
      await t
        .http()
        .post('/agent/generate-source')
        .set('Authorization', bearer(user))
        .field('agentId', agentId)
        .attach('file', Buffer.from('Conteúdo.'), {
          filename: 'conteudo.txt',
          contentType: 'text/plain',
        })
        .expect(404);
    }

    expect(await t.dataSource.getRepository(SourceEntity).count()).toBe(0);
  });

  it('discards the chunks of a source removed while it was still being indexed', async () => {
    const user = await createUser(t.dataSource);
    const agent = await createAgent(t.dataSource);
    const vectorStore = t.app.get<VectorStoreGateway>(VECTOR_STORE);
    const upsertChunks = vectorStore.upsertChunks.bind(vectorStore);
    let releaseIndexing: () => void = () => undefined;
    const indexingGate = new Promise<void>((resolve) => {
      releaseIndexing = resolve;
    });
    jest
      .spyOn(vectorStore, 'upsertChunks')
      .mockImplementation(async (chunks, metadata) => {
        await indexingGate;
        return upsertChunks(chunks, metadata);
      });
    const deleteBySourceId = jest.spyOn(vectorStore, 'deleteBySourceId');

    await t
      .http()
      .post('/agent/generate-source')
      .set('Authorization', bearer(user))
      .field('agentId', agent.id)
      .attach('file', Buffer.from('Política de troca: 30 dias.'), {
        filename: 'politica.txt',
        contentType: 'text/plain',
      })
      .expect(202);

    const source = await t.dataSource
      .getRepository(SourceEntity)
      .findOneByOrFail({ agent_id: agent.id });
    expect(source.status).toBe('processing');

    await t
      .http()
      .delete(`/source/${source.id}`)
      .set('Authorization', bearer(user))
      .expect(204);

    releaseIndexing();
    await waitUntil(async () => deleteBySourceId.mock.calls.length >= 2);

    expect(deleteBySourceId).toHaveBeenLastCalledWith(source.id);
    expect(await searchAs(agent.id, 'troca')).toBe('');

    const row = await t.dataSource
      .getRepository(SourceEntity)
      .findOne({ where: { id: source.id }, withDeleted: true });
    expect(row).toMatchObject({ status: 'processing' });
    expect(row?.deleted_at).toBeTruthy();
  });

  it('marks the sources a previous run left processing as failed when the app boots', async () => {
    const agent = await createAgent(t.dataSource);
    const interrupted = await createSource(t.dataSource, {
      agent_id: agent.id,
      status: 'processing',
      chunk_count: 0,
    });
    const completed = await createSource(t.dataSource, {
      agent_id: agent.id,
    });

    const rebooted = await createTestApp();
    await rebooted.close();

    const repository = t.dataSource.getRepository(SourceEntity);
    expect(
      await repository.findOneByOrFail({ id: interrupted.id }),
    ).toMatchObject({
      status: 'failed',
      error_message: 'Processamento interrompido.',
    });
    expect(
      await repository.findOneByOrFail({ id: completed.id }),
    ).toMatchObject({ status: 'completed', error_message: null });
  });
});
