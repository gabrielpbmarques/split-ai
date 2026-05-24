import { ChatAnthropic } from '@langchain/anthropic';
import { MemorySaver } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool, createAgent } from 'langchain';
import { LoadDatabaseToolService } from 'src/components/Tools/LoadDatabaseTool/load-database-tool.service';
import { LoadVectorSearchToolService } from 'src/components/Tools/LoadVectorSearchTool/load-vector-search-tool.service';
import { config } from 'src/config';
import { AgentEntity } from 'src/entities';
import {
  AgentRepository,
  AgentInstructionRepository,
  OrganizationRepository,
  OrganizationFeatureRepository,
} from 'src/repositories';
import { AgentFinalResponseSchema, ResolvedAgent } from 'src/types';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { z } from 'zod';

import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
import { LoadCheckpointerService } from '../LoadCheckpointer/load-checkpointer.service';

const DATABASE_CONNECTION_FEATURE_KEY = 'database_connection';

@Injectable()
export class ResolveAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationFeatureRepository: OrganizationFeatureRepository,
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
    private readonly buildSystemPromptService: BuildSystemPromptService,
    private readonly loadDatabaseToolService: LoadDatabaseToolService,
    private readonly loadCheckpointerService: LoadCheckpointerService,
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
      this.loadTools(agent),
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

    if (dbAgent.database_tool && dbAgent.organization_id) {
      const databaseTool = await this.maybeLoadDatabaseTool(
        dbAgent.organization_id,
      );
      if (databaseTool) {
        tools.push(databaseTool);
      }
    }

    return tools;
  }

  private async maybeLoadDatabaseTool(
    organizationId: string,
  ): Promise<DynamicStructuredTool<z.ZodObject<any>> | null> {
    const isEnabled =
      await this.organizationFeatureRepository.isEnabledForOrganization(
        organizationId,
        DATABASE_CONNECTION_FEATURE_KEY,
      );
    if (!isEnabled) {
      return null;
    }

    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization?.database_url) {
      return null;
    }

    return this.loadDatabaseToolService.execute({
      databaseUrl: organization.database_url,
    });
  }
}
