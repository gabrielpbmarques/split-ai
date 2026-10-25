import { Injectable, NotFoundException } from '@nestjs/common';

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

@Injectable()
export class GetKnowledgeGraphService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly loadStoreService: LoadStoreService,
  ) {}

  async execute(idOrIdentifier: string): Promise<KnowledgeGraphData> {
    const agent =
      await this.agentRepository.findByIdOrIdentifier(idOrIdentifier);
    if (!agent) {
      throw new NotFoundException('Agente não encontrado.');
    }

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

    const tools = agent.tools ?? [];
    for (const tool of tools) {
      const toolNodeId = `tool:${tool}`;
      nodes.push({
        id: toolNodeId,
        type: 'tool',
        label:
          tool === 'vector_search'
            ? 'Busca vetorial'
            : tool === 'tavily_search'
              ? 'Busca web (Tavily)'
              : tool,
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

    let memoryCount = 0;
    let skillCount = 0;

    try {
      const store = await this.loadStoreService.execute();
      const [storeMemories, storeSkills] = await Promise.all([
        store.search(['memories', agent.id, 'filesystem']),
        store.search(['skills', agent.id, 'filesystem']),
      ]);

      for (const item of storeMemories) {
        const rawKey = String(item.key);
        const label = rawKey.split('/').pop() || rawKey;
        const memId = `mem:store:${rawKey}`;
        memoryCount++;
        nodes.push({
          id: memId,
          type: 'memory',
          label,
          category: 'learned',
          data: {
            path: rawKey,
            preview: this.extractPreview(item.value),
            category: 'learned',
            updatedAt:
              item.updatedAt?.toISOString() ?? new Date().toISOString(),
          },
        });
        edges.push({
          id: `edge:${agentNodeId}-${memId}`,
          source: agentNodeId,
          target: memId,
          label: 'lembra',
        });
      }

      for (const item of storeSkills) {
        const rawKey = String(item.key);
        const label = rawKey.split('/').pop() || rawKey;
        const skillId = `skill:store:${rawKey}`;
        skillCount++;
        nodes.push({
          id: skillId,
          type: 'skill',
          label,
          category: 'learned',
          data: {
            name: label,
            path: rawKey,
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
    } catch {}

    const sources = await this.sourceRepository.listByAgent(agent.id);
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

      if (tools.includes('vector_search')) {
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
        memoryCount,
        skillCount,
        sourceCount: sources.length,
        toolCount: tools.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  private extractPreview(value: unknown): string {
    if (typeof value === 'string') {
      return value.slice(0, 300);
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.content === 'string') {
        return record.content.slice(0, 300);
      }
      return JSON.stringify(value).slice(0, 300);
    }
    return '';
  }
}
