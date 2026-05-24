import { ChatAnthropic } from '@langchain/anthropic';
import { MemorySaver } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool, createAgent } from 'langchain';
import { BusinessContextToolService } from 'src/components/Tools/BusinessContext/business-context-tool.service';
import { DescribeTableToolService } from 'src/components/Tools/DescribeTable/describe-table-tool.service';
import { ExecuteSqlToolService } from 'src/components/Tools/ExecuteSql/execute-sql-tool.service';
import { ExploreSchemaToolService } from 'src/components/Tools/ExploreSchema/explore-schema-tool.service';
import { ValidateSqlToolService } from 'src/components/Tools/ValidateSql/validate-sql-tool.service';
import { config } from 'src/config';
import { AgentEntity } from 'src/entities';
import { AgentRepository, AgentInstructionRepository } from 'src/repositories';
import { AgentFinalResponseSchema, ResolvedAgent } from 'src/types';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { z } from 'zod';

import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
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
    private readonly exploreSchemaToolService: ExploreSchemaToolService,
    private readonly describeTableToolService: DescribeTableToolService,
    private readonly validateSqlToolService: ValidateSqlToolService,
    private readonly executeSqlToolService: ExecuteSqlToolService,
    private readonly businessContextToolService: BusinessContextToolService,
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

    const usesAnalyticsTool =
      dbAgent.analytics_explore_schema ||
      dbAgent.analytics_describe_table ||
      dbAgent.analytics_validate_sql ||
      dbAgent.analytics_execute_sql ||
      dbAgent.analytics_business_context;

    if (usesAnalyticsTool) {
      if (!dbAgent.organization_id) {
        throw new Error(
          'Agente com ferramentas analíticas habilitadas precisa estar vinculado a uma organização (organization_id).',
        );
      }
      const organizationId = dbAgent.organization_id;
      const threadId = String(
        promptVariables?.threadId ?? promptVariables?.sessionId ?? 'default',
      );

      if (dbAgent.analytics_explore_schema) {
        tools.push(
          this.exploreSchemaToolService.execute({
            organizationId,
          }) as DynamicStructuredTool<z.ZodObject<any>>,
        );
      }
      if (dbAgent.analytics_describe_table) {
        tools.push(
          this.describeTableToolService.execute({
            organizationId,
          }) as DynamicStructuredTool<z.ZodObject<any>>,
        );
      }
      if (dbAgent.analytics_validate_sql) {
        tools.push(
          this.validateSqlToolService.execute({
            organizationId,
          }) as DynamicStructuredTool<z.ZodObject<any>>,
        );
      }
      if (dbAgent.analytics_execute_sql) {
        tools.push(
          this.executeSqlToolService.execute({
            organizationId,
            threadId,
          }) as DynamicStructuredTool<z.ZodObject<any>>,
        );
      }
      if (dbAgent.analytics_business_context) {
        tools.push(
          this.businessContextToolService.execute({
            organizationId,
          }) as DynamicStructuredTool<z.ZodObject<any>>,
        );
      }
    }

    return tools;
  }
}
