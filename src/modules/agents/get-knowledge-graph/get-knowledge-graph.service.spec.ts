import { NotFoundException } from '@nestjs/common';

import type {
  AgentConnectionEntity,
  AgentEntity,
  SourceEntity,
} from 'src/infrastructure/database/schema';
import type { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { GetKnowledgeGraphService } from 'src/modules/agents/get-knowledge-graph/get-knowledge-graph.service';
import type { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import type { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import type { LoadStoreService } from 'src/modules/store/load-store/load-store.service';

describe('GetKnowledgeGraphService', () => {
  const baseAgent = {
    id: 'bb9843fa-fd05-4a8c-b5a4-cba1c1725dbc',
    name: 'Sherlock',
    agent_identifier: 'sherlock',
    model: 'deepseek-flash',
    temperature: 0.4,
    with_history: true,
    tools: ['vector_search'],
  } as unknown as AgentEntity;

  const createService = (overrides?: {
    findByIdOrIdentifier?: jest.Mock;
    findEnabledByPrincipalAgentId?: jest.Mock;
    listByAgent?: jest.Mock;
    search?: jest.Mock;
    loadStoreExecute?: jest.Mock;
  }): {
    service: GetKnowledgeGraphService;
    searchMock: jest.Mock;
  } => {
    const searchMock = overrides?.search ?? jest.fn().mockResolvedValue([]);
    const agentRepository = {
      findByIdOrIdentifier:
        overrides?.findByIdOrIdentifier ??
        jest.fn().mockResolvedValue(baseAgent),
    } as unknown as AgentRepository;
    const agentConnectionRepository = {
      findEnabledByPrincipalAgentId:
        overrides?.findEnabledByPrincipalAgentId ??
        jest.fn().mockResolvedValue([]),
    } as unknown as AgentConnectionRepository;
    const sourceRepository = {
      listByAgent: overrides?.listByAgent ?? jest.fn().mockResolvedValue([]),
    } as unknown as SourceRepository;
    const loadStoreService = {
      execute:
        overrides?.loadStoreExecute ??
        jest.fn().mockResolvedValue({ search: searchMock }),
    } as unknown as LoadStoreService;

    return {
      service: new GetKnowledgeGraphService(
        agentRepository,
        agentConnectionRepository,
        sourceRepository,
        loadStoreService,
      ),
      searchMock,
    };
  };

  it('throws NotFoundException when agent does not exist', async () => {
    const { service } = createService({
      findByIdOrIdentifier: jest.fn().mockResolvedValue(null),
    });

    await expect(service.execute('missing')).rejects.toThrow(NotFoundException);
  });

  it('loads memories and skills from both agent_identifier and id namespaces with deduplication', async () => {
    const updatedAt = new Date('2026-11-15T19:16:06.081Z');
    const searchMock = jest
      .fn()
      .mockImplementation(async (namespace: string[]) => {
        const [kind, scope] = namespace;
        if (kind === 'memories' && scope === 'sherlock') {
          return [
            {
              key: '/COMMUNICATION_STYLE.md',
              value: { content: '# Diretriz atualizada' },
              updatedAt,
            },
            {
              key: 'SECURITY_REDTEAM_LOG.md',
              value: { content: ['Linha 1', 'Linha 2'] },
              updatedAt,
            },
          ];
        }
        if (kind === 'memories' && scope === baseAgent.id) {
          return [
            {
              key: '/COMMUNICATION_STYLE.md',
              value: { content: '# Versão antiga' },
              updatedAt,
            },
          ];
        }
        if (kind === 'skills' && scope === 'sherlock') {
          return [
            {
              key: '/shared/coding/SKILL.md',
              value: { content: '# Coding skill' },
              updatedAt,
            },
          ];
        }
        return [];
      });

    const { service } = createService({ search: searchMock });
    const result = await service.execute('sherlock');

    expect(result.stats).toMatchObject({
      memoryCount: 2,
      skillCount: 1,
      toolCount: 1,
      sourceCount: 0,
      totalNodes: 5,
      totalEdges: 4,
    });

    const memoryNodes = result.nodes.filter((node) => node.type === 'memory');
    expect(memoryNodes).toEqual([
      expect.objectContaining({
        id: 'mem:store:/COMMUNICATION_STYLE.md',
        label: 'COMMUNICATION_STYLE.md',
        category: 'learned',
        data: expect.objectContaining({
          path: '/COMMUNICATION_STYLE.md',
          preview: '# Diretriz atualizada',
        }),
      }),
      expect.objectContaining({
        id: 'mem:store:/SECURITY_REDTEAM_LOG.md',
        label: 'SECURITY_REDTEAM_LOG.md',
        data: expect.objectContaining({
          path: '/SECURITY_REDTEAM_LOG.md',
          preview: 'Linha 1\nLinha 2',
        }),
      }),
    ]);

    const skillNodes = result.nodes.filter((node) => node.type === 'skill');
    expect(skillNodes).toEqual([
      expect.objectContaining({
        id: 'skill:store:/shared/coding/SKILL.md',
        label: 'SKILL.md',
        category: 'shared',
        data: expect.objectContaining({
          path: '/shared/coding/SKILL.md',
          description: '# Coding skill',
        }),
      }),
    ]);
  });

  it('paginates store search when a namespace has more than 100 items', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      key: `/DOC_${index}.md`,
      value: { content: `Doc ${index}` },
    }));
    const secondPage = [{ key: '/DOC_100.md', value: { content: 'Doc 100' } }];

    const searchMock = jest
      .fn()
      .mockImplementation(
        async (namespace: string[], options?: { offset?: number }) => {
          if (namespace[0] === 'memories' && namespace[1] === 'sherlock') {
            return options?.offset === 100 ? secondPage : firstPage;
          }
          return [];
        },
      );

    const { service } = createService({ search: searchMock });
    const result = await service.execute('sherlock');

    expect(result.stats.memoryCount).toBe(101);
  });

  it('includes enabled agent connections as tools and links vector_search to sources', async () => {
    const connections = [
      {
        id: 'conn-1',
        child_agent_id: 'child-1',
        tool_name: 'consultar_estoque',
        tool_description: 'Consulta o estoque.',
        enabled: true,
      },
      {
        id: 'conn-2',
        child_agent_id: 'child-2',
        tool_name: 'vector_search',
        tool_description: 'Duplicada',
        enabled: true,
      },
    ] as unknown as AgentConnectionEntity[];

    const sources = [
      {
        id: 'src-1',
        name: 'Manual.pdf',
        source_type: 'pdf',
        file_name: 'manual.pdf',
        url: null,
        status: 'completed',
        chunk_count: 10,
        created_at: new Date('2026-11-15T10:00:00Z'),
      },
    ] as unknown as SourceEntity[];

    const { service } = createService({
      findEnabledByPrincipalAgentId: jest.fn().mockResolvedValue(connections),
      listByAgent: jest.fn().mockResolvedValue(sources),
    });

    const result = await service.execute('sherlock');

    expect(result.stats).toMatchObject({
      toolCount: 2,
      sourceCount: 1,
    });
    expect(
      result.nodes.find((node) => node.id === 'tool:consultar_estoque'),
    ).toMatchObject({
      type: 'tool',
      label: 'consultar_estoque',
      category: 'connection',
      data: {
        tool: 'consultar_estoque',
        description: 'Consulta o estoque.',
        childAgentId: 'child-1',
      },
    });
    expect(
      result.edges.find(
        (edge) => edge.id === 'edge:tool:vector_search-source:src-1',
      ),
    ).toEqual({
      id: 'edge:tool:vector_search-source:src-1',
      source: 'tool:vector_search',
      target: 'source:src-1',
      label: 'indexa',
    });
  });

  it('continues returning agent, tools and sources if store loading fails', async () => {
    const { service } = createService({
      loadStoreExecute: jest
        .fn()
        .mockRejectedValue(new Error('Store indisponível')),
    });

    const result = await service.execute('sherlock');

    expect(result.stats).toMatchObject({
      memoryCount: 0,
      skillCount: 0,
      toolCount: 1,
    });
    expect(result.nodes).toHaveLength(2);
  });

  it('returns full markdown content for memories and skills without 300-char truncation', async () => {
    const longMemory = `# Estilo de Comunicação\n\n${'Parágrafo longo com regras de formatação em **markdown**. '.repeat(15)}`;
    const longSkill = `# Habilidade Investigativa\n\n${'- Passo detalhado de investigação técnica.\n'.repeat(20)}`;

    const searchMock = jest
      .fn()
      .mockImplementation(async (namespace: string[]) => {
        if (namespace[0] === 'memories' && namespace[1] === 'sherlock') {
          return [
            {
              namespace,
              key: '/COMMUNICATION_STYLE.md',
              value: { content: longMemory },
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        }
        if (namespace[0] === 'skills' && namespace[1] === 'sherlock') {
          return [
            {
              namespace,
              key: '/INVESTIGATION.md',
              value: { content: longSkill },
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        }
        return [];
      });

    const { service } = createService({ search: searchMock });
    const result = await service.execute('sherlock');

    const memoryNode = result.nodes.find(
      (node) => node.id === 'mem:store:/COMMUNICATION_STYLE.md',
    );
    const skillNode = result.nodes.find(
      (node) => node.id === 'skill:store:/INVESTIGATION.md',
    );

    expect(longMemory.length).toBeGreaterThan(300);
    expect(longSkill.length).toBeGreaterThan(300);
    expect(memoryNode?.data.preview).toBe(longMemory);
    expect(skillNode?.data.description).toBe(longSkill);
  });
});
