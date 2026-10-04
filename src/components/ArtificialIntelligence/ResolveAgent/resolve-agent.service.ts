import { ChatAnthropic } from '@langchain/anthropic';
import { MemorySaver } from '@langchain/langgraph';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { createAgent, createMiddleware } from 'langchain';
import { LoadAgentToolsService } from 'src/components/Tools/LoadAgentTools/load-agent-tools.service';
import { AgentEntity } from 'src/entities';
import { AgentRepository, AgentInstructionRepository } from 'src/repositories';
import { env } from 'src/shared/config/env';
import { AgentFinalResponseSchema, ResolvedAgent } from 'src/types';
import { sanitizeToolCallMessages } from 'src/utils/sanitizeToolCallMessages';

import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
import { LoadCheckpointerService } from '../LoadCheckpointer/load-checkpointer.service';

const sanitizeHistoryMiddleware = createMiddleware({
  name: 'sanitize-tool-call-history',
  wrapModelCall: (request, handler) =>
    handler({
      ...request,
      messages: sanitizeToolCallMessages(request.messages),
    }),
});

@Injectable()
export class ResolveAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly buildSystemPromptService: BuildSystemPromptService,
    private readonly loadCheckpointerService: LoadCheckpointerService,
    @Inject(forwardRef(() => LoadAgentToolsService))
    private readonly loadAgentToolsService: LoadAgentToolsService,
  ) {}

  async execute(
    agentId: string,
    promptVariables?: any,
    memorySaver?: MemorySaver,
    connectionContext?: { depth: number; visited: string[] },
  ): Promise<ResolvedAgent> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        agentId,
      );
    const agent = await this.agentRepository.findOne({
      where: isUuid ? { id: agentId } : { agent_identifier: agentId },
    });

    if (!agent) {
      throw new Error('Agent não encontrado');
    }

    const latestInstructions =
      await this.agentInstructionRepository.findLatestByAgentId(agent.id);

    const runnableOpts = { withHistory: !!agent.with_history };

    const scopeCompanyId =
      promptVariables?.companyId != null &&
      `${promptVariables.companyId}` !== ''
        ? String(promptVariables.companyId)
        : undefined;

    const [chat, tools] = await Promise.all([
      this.loadChat(agent),
      this.loadAgentToolsService.execute(
        agent,
        connectionContext,
        scopeCompanyId,
      ),
    ]);

    const systemPrompt = await this.buildSystemPromptService.execute(
      latestInstructions?.instructions,
      tools,
      {
        ...promptVariables,
        organizationId: agent.organization_id,
      },
    );

    const isDelegatedChild = (connectionContext?.depth ?? 0) > 0;

    let checkpointer;

    if (runnableOpts.withHistory && !isDelegatedChild) {
      checkpointer = memorySaver ?? this.loadCheckpointerService.execute();
    }

    const runnable = createAgent({
      model: chat as any,
      tools,
      systemPrompt,
      checkpointer,
      middleware: [sanitizeHistoryMiddleware],
      responseFormat: AgentFinalResponseSchema,
    });

    return {
      id: agent.id,
      systemPrompt,
      chat,
      tools,
      runnableOpts,
      sites: (agent as any).sites || undefined,
      organization_id: agent.organization_id,
      runnable,
    };
  }

  private async loadChat(agent: AgentEntity): Promise<ChatAnthropic> {
    const model = agent.model || env.AI_MODEL;

    return new ChatAnthropic({
      model,
      temperature: agent.temperature ?? 0.4,
      clientOptions: {
        baseURL: 'https://api.deepseek.com/anthropic',
      },
    });
  }
}
