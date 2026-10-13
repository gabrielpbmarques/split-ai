import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CompositeBackend,
  createDeepAgent,
  type DeepAgent,
  StateBackend,
  StoreBackend,
} from 'deepagents';

import type { AgentEntity } from 'src/infrastructure/database/schema';
import {
  CHAT_MODEL,
  type ChatModelFactory,
} from 'src/infrastructure/integration/chat-model.port';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { LoadAgentToolsService } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.service';
import { env } from 'src/shared/config/env';

@Injectable()
export class ResolveAgentService {
  private static store?: PostgresStore;

  constructor(
    @Inject(CHAT_MODEL) private readonly chatModelFactory: ChatModelFactory,
    private readonly agentRepository: AgentRepository,
    private readonly loadAgentToolsService: LoadAgentToolsService,
  ) {}

  private async getStore(): Promise<PostgresStore> {
    if (!ResolveAgentService.store) {
      const store = PostgresStore.fromConnString(env.DATABASE_URL);
      await store.setup();
      ResolveAgentService.store = store;
    }
    return ResolveAgentService.store;
  }

  async execute(agentId: string): Promise<DeepAgent & { id: string }> {
    const agentPayload =
      await this.agentRepository.findByIdOrIdentifier(agentId);

    if (!agentPayload) {
      throw new NotFoundException('Agente não encontrado');
    }

    if (!agentPayload.system_prompt) {
      throw new NotFoundException('Agente sem instruções configuradas');
    }

    const store = await this.getStore();
    const chat = this.loadChat(agentPayload);
    const tools = await this.loadAgentToolsService.execute(agentPayload);

    const agent = createDeepAgent({
      model: chat,
      systemPrompt: agentPayload.system_prompt,
      tools,
      memory: ['/memories/sherlock/AGENTS.md', '/scratchpad/notes.md'],
      skills: ['/skills/'],
      store,
      backend: new CompositeBackend(new StateBackend(), {
        '/memories/': new StoreBackend({
          namespace: ['agents', agentPayload.id, 'memories'],
        }),
        '/skills/': new StoreBackend({
          namespace: ['agents', agentPayload.id, 'skills'],
        }),
      }),
    });

    return Object.assign(agent, { id: agentPayload.id });
  }

  private loadChat(agent: AgentEntity): BaseChatModel {
    return this.chatModelFactory.create({
      model: agent.model,
      temperature: agent.temperature,
    });
  }
}
