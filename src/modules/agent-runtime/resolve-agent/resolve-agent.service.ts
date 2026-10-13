import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
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
  CHAT_MODEL_SERVICE,
  type IChatModelService,
} from 'src/infrastructure/providers/anthropic.provider';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';
import { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';

@Injectable()
export class ResolveAgentService {
  constructor(
    @Inject(CHAT_MODEL_SERVICE)
    private readonly chatModelFactory: IChatModelService,
    private readonly agentRepository: AgentRepository,
    private readonly toolLoaderService: ToolLoaderService,
    private readonly loadStoreService: LoadStoreService,
  ) {}

  async execute(agentId: string): Promise<DeepAgent & { id: string }> {
    const agentPayload =
      await this.agentRepository.findByIdOrIdentifier(agentId);

    if (!agentPayload) {
      throw new NotFoundException('Agente não encontrado');
    }

    const store = await this.loadStoreService.execute();
    const chat = this.loadChat(agentPayload);
    const tools = await this.toolLoaderService.execute(agentPayload);

    const agent = createDeepAgent({
      model: chat,
      tools,
      memory: [
        '/memories/sherlock/AGENTS.md',
        '/scratchpad/notes.md',
        '/memories/',
      ],
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
