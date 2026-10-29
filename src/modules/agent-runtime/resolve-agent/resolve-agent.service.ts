import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CompositeBackend,
  createDeepAgent,
  type CreateDeepAgentParams,
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
import { LoadCheckpointerService } from 'src/modules/store/load-checkpointer/load-checkpointer.service';
import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';
import { LoadSubagentsService } from 'src/modules/subagents/load-subagents/load-subagents.service';
import { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';

@Injectable()
export class ResolveAgentService {
  constructor(
    @Inject(CHAT_MODEL_SERVICE)
    private readonly chatModelFactory: IChatModelService,
    private readonly agentRepository: AgentRepository,
    private readonly toolLoaderService: ToolLoaderService,
    private readonly loadStoreService: LoadStoreService,
    private readonly loadCheckpointerService: LoadCheckpointerService,
    private readonly resolveSystemPromptService: ResolveSystemPromptService,
    private readonly resolveMemorySourcesService: ResolveMemorySourcesService,
    private readonly resolveSkillSourcesService: ResolveSkillSourcesService,
    private readonly loadSubagentsService: LoadSubagentsService,
  ) {}

  async execute(agentId: string): Promise<DeepAgent> {
    const agentPayload =
      await this.agentRepository.findByIdOrIdentifier(agentId);

    if (!agentPayload) {
      throw new NotFoundException('Agente não encontrado');
    }

    const [
      store,
      checkpointer,
      subagents,
      tools,
      systemPrompt,
      memory,
      skills,
    ] = await Promise.all([
      this.loadStoreService.execute(),
      this.loadCheckpointerService.execute(),
      this.loadSubagentsService.execute(),
      this.toolLoaderService.execute(agentPayload.agent_identifier),
      this.resolveSystemPromptService.execute(agentPayload.agent_identifier),
      this.resolveMemorySourcesService.execute(agentPayload.agent_identifier),
      this.resolveSkillSourcesService.execute(agentPayload.agent_identifier),
    ]);

    const agent = createDeepAgent({
      model: this.loadChat(agentPayload),
      tools,
      systemPrompt,
      subagents,
      memory: [...memory],
      skills: [...skills],
      checkpointer:
        checkpointer as unknown as CreateDeepAgentParams['checkpointer'],
      store,
      backend: new CompositeBackend(new StateBackend(), {
        '/memories/': new StoreBackend({
          namespace: ['memories', agentPayload.agent_identifier, 'filesystem'],
        }),
        '/skills/': new StoreBackend({
          namespace: ['skills', agentPayload.agent_identifier, 'filesystem'],
        }),
        '/scratchpad/': new StoreBackend({
          namespace: [
            'scratchpad',
            agentPayload.agent_identifier,
            'filesystem',
          ],
        }),
      }),
    });

    return agent;
  }

  private loadChat(agent: AgentEntity): BaseChatModel {
    return this.chatModelFactory.create({
      model: agent.model,
      temperature: agent.temperature,
    });
  }
}
