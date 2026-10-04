import { ChatAnthropic } from '@langchain/anthropic';
import { MemorySaver } from '@langchain/langgraph';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createAgent, createMiddleware } from 'langchain';

import { AgentEntity } from 'src/infrastructure/database/schema';
import { BuildSystemPromptService } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.service';
import { LoadCheckpointerService } from 'src/modules/agent-runtime/load-checkpointer/load-checkpointer.service';
import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { LoadAgentToolsService } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.service';
import { env } from 'src/shared/config/env';
import { AgentFinalResponseSchema, ResolvedAgent } from 'src/shared/contracts';
import { sanitizeToolCallMessages } from 'src/shared/utils/sanitize-tool-call-messages';

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
    private readonly loadAgentToolsService: LoadAgentToolsService,
  ) {}

  async execute(
    agentId: string,
    promptVariables?: any,
    memorySaver?: MemorySaver,
    connectionContext?: { depth: number; visited: string[] },
  ): Promise<ResolvedAgent> {
    const agent =
      await this.agentRepository.findByIdOrIdentifierWithOrganization(agentId);

    if (!agent) {
      throw new NotFoundException('Agente não encontrado');
    }

    if (agent.organization?.status === 'inactive') {
      throw new ForbiddenException(
        'A organização responsável por este agente está inativa.',
      );
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
