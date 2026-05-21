import { ChatAnthropic } from '@langchain/anthropic';
import { MemorySaver } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool, createAgent } from 'langchain';
import { config } from 'src/config';
import { AgentEntity } from 'src/entities';
import { AgentRepository, AgentInstructionRepository } from 'src/repositories';
import { AgentFinalResponseSchema, ResolvedAgent } from 'src/types';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { z } from 'zod';

import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
import { LoadAnalyticsToolsService } from '../LoadAnalyticsTools/load-analytics-tools.service';
import { LoadCheckpointerService } from '../LoadCheckpointer/load-checkpointer.service';
import { LoadDatabaseToolService } from '../LoadDatabaseTool/load-database-tool.service';
import { LoadVectorSearchToolService } from '../LoadVectorSearchTool/load-vector-search-tool.service';

@Injectable()
export class ResolveAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
    private readonly buildSystemPromptService: BuildSystemPromptService,
    private readonly loadDatabaseToolService: LoadDatabaseToolService,
    private readonly loadCheckpointerService: LoadCheckpointerService,
    private readonly loadAnalyticsToolsService: LoadAnalyticsToolsService,
  ) {}

  async execute(
    agentId: string,
    promptVariables?: any,
    memorySaver?: MemorySaver,
  ): Promise<ResolvedAgent> {
    // Postgres rejects non-UUID strings when binding `id` (uuid column), so
    // route the lookup by shape: UUID-shaped → `id`, otherwise → `agent_identifier`.
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

    const [chat, tools] = await Promise.all([
      this.loadChat(agent),
      this.loadTools(agent, promptVariables),
    ]);

    const systemPrompt = await this.buildSystemPromptService.execute(
      latestInstructions?.instructions,
      tools,
      {
        ...promptVariables,
        organizationId: agent.organization_id,
      },
    );

    let checkpointer;

    if (runnableOpts.withHistory) {
      if (memorySaver) {
        checkpointer = memorySaver;
      } else {
        checkpointer = this.loadCheckpointerService.execute();
      }
    }

    const runnable = createAgent({
      model: chat as any,
      tools,
      systemPrompt,
      checkpointer,
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
    return new ChatAnthropic({
      model: agent.model || config.aiModel,
      temperature: agent.temperature ?? 0.4,
    });
  }

  private async loadTools(
    dbAgent: AgentEntity,
    promptVariables?: any,
  ): Promise<DynamicStructuredTool<z.ZodObject<any>>[]> {
    const tools: DynamicStructuredTool<z.ZodObject<any>>[] = [];

    if (dbAgent.parser_schema) {
      tools.push(
        buildLangchainToolFromSchema(
          dbAgent.parser_name || 'dynamic_parser',
          dbAgent.parser_description || 'Ferramenta de parsing dinâmica',
          dbAgent.parser_schema,
        ),
      );
    }

    if (dbAgent.vector_search_tool) {
      tools.push(await this.loadVectorSearchToolService.execute());
    }

    if (dbAgent.database_tool) {
      tools.push(
        await this.loadDatabaseToolService.execute(dbAgent.organization_id),
      );
    }

    if (this.loadAnalyticsToolsService.appliesTo(dbAgent.agent_identifier)) {
      const companyId = Number(promptVariables?.companyId);
      const threadId = String(
        promptVariables?.threadId ?? promptVariables?.sessionId ?? 'default',
      );
      if (!Number.isFinite(companyId) || companyId <= 0) {
        throw new Error(
          'companyId obrigatório no promptVariables para agentes de analytics',
        );
      }
      const analyticsTools = this.loadAnalyticsToolsService.execute(
        dbAgent.agent_identifier as string,
        { companyId, threadId },
      );
      tools.push(...analyticsTools);
    }

    return tools;
  }
}
