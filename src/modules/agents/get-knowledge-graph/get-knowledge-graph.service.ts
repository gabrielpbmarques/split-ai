import type { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';

export interface KnowledgeGraphNode {
  id: string;
  type: 'agent' | 'tool' | 'memory' | 'skill' | 'source';
  label: string;
  category?: string;
  data: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraphStats {
  totalNodes: number;
  totalEdges: number;
  memoryCount: number;
  skillCount: number;
  sourceCount: number;
  toolCount: number;
  lastUpdated: string;
}

export interface KnowledgeGraphData {
  agent: {
    id: string;
    name: string;
    identifier: string | null;
    model: string | null;
  };
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  stats: KnowledgeGraphStats;
}

interface StoreKnowledgeItem {
  key: string;
  value: unknown;
  updatedAt?: Date;
}

const STORE_PAGE_SIZE = 100;

@Injectable()
export class GetKnowledgeGraphService {
  private readonly logger = new Logger(GetKnowledgeGraphService.name);

  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly loadStoreService: LoadStoreService,
  ) {}

  async execute(idOrIdentifier: string): Promise<KnowledgeGraphData> {
    const agent =
      await this.agentRepository.findByIdOrIdentifier(idOrIdentifier);
    if (!agent) {
      throw new NotFoundException('Agente não encontrado.');
    }

    const [storeKnowledge, sources, connections] = await Promise.all([
      this.loadStoreKnowledge(agent),
      this.sourceRepository.listByAgent(agent.id),
      this.agentConnectionRepository.findEnabledByPrincipalAgentId(agent.id),
    ]);

    const nodes: KnowledgeGraphNode[] = [];
    const edges: KnowledgeGraphEdge[] = [];

    const agentNodeId = 'agent';
    nodes.push({
      id: agentNodeId,
      type: 'agent',
      label: agent.name,
      category: 'agent',
      data: {
        id: agent.id,
        identifier: agent.agent_identifier,
        model: agent.model,
        temperature: agent.temperature,
        withHistory: agent.with_history,
      },
    });

    const seenToolIds = new Set<string>();
    for (const tool of agent.tools ?? []) {
      const toolNodeId = `tool:${tool}`;
      if (seenToolIds.has(toolNodeId)) continue;
      seenToolIds.add(toolNodeId);
      nodes.push({
        id: toolNodeId,
        type: 'tool',
        label: this.resolveToolLabel(tool),
        category: 'tool',
        data: { tool },
      });
      edges.push({
        id: `edge:${agentNodeId}-${toolNodeId}`,
        source: agentNodeId,
        target: toolNodeId,
        label: 'usa',
      });
    }

    for (const connection of connections) {
      const toolNodeId = `tool:${connection.tool_name}`;
      if (seenToolIds.has(toolNodeId)) continue;
      seenToolIds.add(toolNodeId);
      nodes.push({
        id: toolNodeId,
        type: 'tool',
        label: connection.tool_name,
        category: 'connection',
        data: {
          tool: connection.tool_name,
          description: connection.tool_description,
          childAgentId: connection.child_agent_id,
        },
      });
      edges.push({
        id: `edge:${agentNodeId}-${toolNodeId}`,
        source: agentNodeId,
        target: toolNodeId,
        label: 'usa',
      });
    }

    for (const item of storeKnowledge.memories) {
      const label = item.key.split('/').pop() || item.key;
      const memId = `mem:store:${item.key}`;
      nodes.push({
        id: memId,
        type: 'memory',
        label,
        category: 'learned',
        data: {
          path: item.key,
          preview: this.extractPreview(item.value),
          category: 'learned',
          updatedAt: item.updatedAt?.toISOString() ?? new Date().toISOString(),
        },
      });
      edges.push({
        id: `edge:${agentNodeId}-${memId}`,
        source: agentNodeId,
        target: memId,
        label: 'lembra',
      });
    }

    for (const item of storeKnowledge.skills) {
      const label = item.key.split('/').pop() || item.key;
      const skillId = `skill:store:${item.key}`;
      const category = item.key.startsWith('/shared/') ? 'shared' : 'learned';
      nodes.push({
        id: skillId,
        type: 'skill',
        label,
        category,
        data: {
          name: label,
          path: item.key,
          description: this.extractPreview(item.value),
        },
      });
      edges.push({
        id: `edge:${agentNodeId}-${skillId}`,
        source: agentNodeId,
        target: skillId,
        label: 'domina',
      });
    }

    for (const source of sources) {
      const sourceNodeId = `source:${source.id}`;
      nodes.push({
        id: sourceNodeId,
        type: 'source',
        label: source.name,
        category: source.source_type,
        data: {
          id: source.id,
          type: source.source_type,
          fileName: source.file_name,
          url: source.url,
          status: source.status,
          chunkCount: source.chunk_count,
          createdAt: source.created_at,
        },
      });
      edges.push({
        id: `edge:${agentNodeId}-${sourceNodeId}`,
        source: agentNodeId,
        target: sourceNodeId,
        label: 'consulta',
      });

      if (seenToolIds.has('tool:vector_search')) {
        edges.push({
          id: `edge:tool:vector_search-${sourceNodeId}`,
          source: 'tool:vector_search',
          target: sourceNodeId,
          label: 'indexa',
        });
      }
    }

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        identifier: agent.agent_identifier,
        model: agent.model,
      },
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        memoryCount: storeKnowledge.memories.length,
        skillCount: storeKnowledge.skills.length,
        sourceCount: sources.length,
        toolCount: seenToolIds.size,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  private async loadStoreKnowledge(agent: AgentEntity): Promise<{
    memories: StoreKnowledgeItem[];
    skills: StoreKnowledgeItem[];
  }> {
    try {
      const store = await this.loadStoreService.execute();
      const scopes = Array.from(
        new Set(
          [agent.agent_identifier, agent.id].filter((value): value is string =>
            Boolean(value),
          ),
        ),
      );

      const [memoryBatches, skillBatches] = await Promise.all([
        Promise.all(
          scopes.map((scope) =>
            this.searchAllStoreItems(store, ['memories', scope, 'filesystem']),
          ),
        ),
        Promise.all(
          scopes.map((scope) =>
            this.searchAllStoreItems(store, ['skills', scope, 'filesystem']),
          ),
        ),
      ]);

      return {
        memories: this.deduplicateStoreItems(memoryBatches.flat()),
        skills: this.deduplicateStoreItems(skillBatches.flat()),
      };
    } catch (error) {
      this.logger.warn(
        `Falha ao consultar store de memórias/skills do agente ${agent.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { memories: [], skills: [] };
    }
  }

  private async searchAllStoreItems(
    store: PostgresStore,
    namespace: string[],
  ): Promise<StoreKnowledgeItem[]> {
    const collected: StoreKnowledgeItem[] = [];
    let offset = 0;

    while (true) {
      const batch = await store.search(namespace, {
        limit: STORE_PAGE_SIZE,
        offset,
      });

      for (const item of batch) {
        collected.push({
          key: String(item.key),
          value: item.value,
          updatedAt: item.updatedAt,
        });
      }

      if (batch.length < STORE_PAGE_SIZE) {
        break;
      }

      offset += STORE_PAGE_SIZE;
    }

    return collected;
  }

  private deduplicateStoreItems(
    items: StoreKnowledgeItem[],
  ): StoreKnowledgeItem[] {
    const byKey = new Map<string, StoreKnowledgeItem>();
    for (const item of items) {
      const normalizedKey = item.key.startsWith('/')
        ? item.key
        : `/${item.key}`;
      if (!byKey.has(normalizedKey)) {
        byKey.set(normalizedKey, { ...item, key: normalizedKey });
      }
    }
    return Array.from(byKey.values());
  }

  private resolveToolLabel(tool: string): string {
    if (tool === 'vector_search') return 'Busca vetorial';
    if (tool === 'tavily_search') return 'Busca web (Tavily)';
    return tool;
  }

  private extractPreview(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.content === 'string') {
        return record.content;
      }
      if (Array.isArray(record.content)) {
        return record.content.map(String).join('\n');
      }
      return JSON.stringify(value, null, 2);
    }
    return '';
  }
}
