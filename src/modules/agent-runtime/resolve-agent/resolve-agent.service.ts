import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { MemorySaver } from '@langchain/langgraph';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createAgent, createMiddleware } from 'langchain';

import { AgentEntity } from 'src/infrastructure/database/schema';
import {
  CHAT_MODEL,
  ChatModelFactory,
} from 'src/infrastructure/integration/chat-model.port';
import { BuildSystemPromptService } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.service';
import { LoadCheckpointerService } from 'src/modules/agent-runtime/load-checkpointer/load-checkpointer.service';
import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { LoadAgentToolsService } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.service';
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
    @Inject(CHAT_MODEL) private readonly chatModelFactory: ChatModelFactory,
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

    const chat = this.loadChat(agent);
    const tools = await this.loadAgentToolsService.execute(
      agent,
      connectionContext,
      scopeCompanyId,
    );

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

  private loadChat(agent: AgentEntity): BaseChatModel {
    return this.chatModelFactory.create({
      model: agent.model,
      temperature: agent.temperature,
    });
  }
}
