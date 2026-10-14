import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable, NotFoundException } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';
import { isUuid } from 'src/shared/utils/is-uuid';

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

interface GraphElementInfo {
  label: string;
  category: string;
  data: Record<string, unknown>;
}

@Injectable()
export class GetKnowledgeGraphService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly loadStoreService: LoadStoreService,
  ) {}

  async execute(idOrIdentifier: string): Promise<KnowledgeGraphData> {
    const agent = await this.resolveAgent(idOrIdentifier);
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
      const toolLabel = tool === 'vector_search' ? 'Busca vetorial' : tool;
      nodes.push({
        id: toolNodeId,
        type: 'tool',
        label: toolLabel,
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

    const memoryMap = new Map<string, GraphElementInfo>();

    if (agent.agent_identifier) {
      const memoriesDir = join(
        process.cwd(),
        'memories',
        agent.agent_identifier,
      );
      this.collectDiskMemories(memoriesDir, agent.agent_identifier, memoryMap);
    }

    try {
      const store = await this.loadStoreService.execute();
      const storeMemories = await store.search([
        'memories',
        agent.id,
        'filesystem',
      ]);
      for (const item of storeMemories) {
        const rawKey = String(item.key);
        const label = rawKey.split('/').pop() || rawKey;
        const preview = this.extractPreview(item.value);
        memoryMap.set(`mem:store:${rawKey}`, {
          label,
          category: 'learned',
          data: {
            path: rawKey,
            preview,
            category: 'learned',
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch {}

    for (const [memId, memInfo] of memoryMap.entries()) {
      nodes.push({
        id: memId,
        type: 'memory',
        label: memInfo.label,
        category: memInfo.category,
        data: memInfo.data,
      });
      edges.push({
        id: `edge:${agentNodeId}-${memId}`,
        source: agentNodeId,
        target: memId,
        label: 'lembra',
      });
    }

    const skillMap = new Map<string, GraphElementInfo>();

    if (agent.agent_identifier) {
      const agentSkillsDir = join(
        process.cwd(),
        'skills',
        agent.agent_identifier,
      );
      this.collectDiskSkills(agentSkillsDir, 'custom', skillMap);
    }
    const sharedSkillsDir = join(process.cwd(), 'skills', 'shared');
    this.collectDiskSkills(sharedSkillsDir, 'shared', skillMap);

    try {
      const store = await this.loadStoreService.execute();
      const storeSkills = await store.search([
        'skills',
        agent.id,
        'filesystem',
      ]);
      for (const item of storeSkills) {
        const rawKey = String(item.key);
        const label = rawKey.split('/').pop() || rawKey;
        const description = this.extractPreview(item.value);
        skillMap.set(`skill:store:${rawKey}`, {
          label,
          category: 'learned',
          data: {
            name: label,
            path: rawKey,
            description,
          },
        });
      }
    } catch {}

    for (const [skillId, skillInfo] of skillMap.entries()) {
      nodes.push({
        id: skillId,
        type: 'skill',
        label: skillInfo.label,
        category: skillInfo.category,
        data: skillInfo.data,
      });
      edges.push({
        id: `edge:${agentNodeId}-${skillId}`,
        source: agentNodeId,
        target: skillId,
        label: 'domina',
      });
    }

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

    const stats: KnowledgeGraphStats = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      memoryCount: memoryMap.size,
      skillCount: skillMap.size,
      sourceCount: sources.length,
      toolCount: tools.length,
      lastUpdated: new Date().toISOString(),
    };

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        identifier: agent.agent_identifier,
        model: agent.model,
      },
      nodes,
      edges,
      stats,
    };
  }

  private collectDiskMemories(
    dir: string,
    identifier: string,
    map: Map<string, GraphElementInfo>,
    baseRel = '',
  ): void {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry.startsWith('.')) continue;
        const fullPath = join(dir, entry);
        const relPath = baseRel ? `${baseRel}/${entry}` : entry;
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          this.collectDiskMemories(fullPath, identifier, map, relPath);
        } else if (entry.endsWith('.md')) {
          let preview = '';
          try {
            preview = readFileSync(fullPath, 'utf-8').slice(0, 300);
          } catch {}
          map.set(`mem:disk:${relPath}`, {
            label: entry,
            category: 'system',
            data: {
              path: `/memories/${identifier}/${relPath}`,
              preview,
              category: 'system',
              updatedAt: stat.mtime.toISOString(),
            },
          });
        }
      }
    } catch {}
  }

  private collectDiskSkills(
    dir: string,
    category: string,
    map: Map<string, GraphElementInfo>,
  ): void {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry.startsWith('.') || entry === 'README.md') continue;
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          let description = '';
          const skillMdPath = join(fullPath, 'SKILL.md');
          try {
            description = readFileSync(skillMdPath, 'utf-8').slice(0, 300);
          } catch {}
          map.set(`skill:disk:${entry}`, {
            label: entry,
            category,
            data: {
              name: entry,
              path: fullPath,
              description,
            },
          });
        } else if (entry.endsWith('.md')) {
          let description = '';
          try {
            description = readFileSync(fullPath, 'utf-8').slice(0, 300);
          } catch {}
          map.set(`skill:disk:${entry}`, {
            label: entry.replace(/\.md$/, ''),
            category,
            data: {
              name: entry,
              path: fullPath,
              description,
            },
          });
        }
      }
    } catch {}
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

  private async resolveAgent(
    idOrIdentifier: string,
  ): Promise<AgentEntity | null> {
    if (isUuid(idOrIdentifier)) {
      const byId = await this.agentRepository.findById(idOrIdentifier);
      if (byId) return byId;
    }
    return this.agentRepository.findByIdentifier(idOrIdentifier);
  }
}
