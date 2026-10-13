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
import { ResolveMemorySourcesService } from 'src/modules/agent-runtime/resolve-memory-sources/resolve-memory-sources.service';
import { ResolveSkillSourcesService } from 'src/modules/agent-runtime/resolve-skill-sources/resolve-skill-sources.service';
import { ResolveSystemPromptService } from 'src/modules/agent-runtime/resolve-system-prompt/resolve-system-prompt.service';
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
    private readonly resolveSystemPromptService: ResolveSystemPromptService,
    private readonly resolveMemorySourcesService: ResolveMemorySourcesService,
    private readonly resolveSkillSourcesService: ResolveSkillSourcesService,
  ) {}

  async execute(agentId: string): Promise<DeepAgent & { id: string }> {
    const agentPayload =
      await this.agentRepository.findByIdOrIdentifier(agentId);

    if (!agentPayload) {
      throw new NotFoundException('Agente não encontrado');
    }

    const identifier = agentPayload.agent_identifier;
    const store = await this.loadStoreService.execute();
    const chat = this.loadChat(agentPayload);
    const tools = await this.toolLoaderService.execute(agentPayload);
    const systemPrompt =
      await this.resolveSystemPromptService.execute(agentPayload);
    const memory = await this.resolveMemorySourcesService.execute(identifier);
    const skills = await this.resolveSkillSourcesService.execute(identifier);

    const agent = createDeepAgent({
      model: chat,
      tools,
      systemPrompt,
      memory: [...memory],
      skills: [...skills],
      store,
      backend: new CompositeBackend(new StateBackend(), {
        '/memories/': new StoreBackend({
          namespace: ['memories', agentPayload.id, 'filesystem'],
        }),
        '/skills/': new StoreBackend({
          namespace: ['skills', agentPayload.id, 'filesystem'],
        }),
        '/scratchpad/': new StoreBackend({
          namespace: ['scratchpad', agentPayload.id, 'filesystem'],
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
