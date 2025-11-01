import { ChatVertexAI } from '@langchain/google-vertexai';
import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { config } from 'src/config';
import { AgentEntity } from 'src/entities';
import { AgentRepository, AgentInstructionRepository } from 'src/repositories';
import { ResolvedAgent } from 'src/types';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { z } from 'zod';

import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
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
  ) {}

  async execute(
    agentId: string,
    promptVariables?: any,
  ): Promise<ResolvedAgent> {
    const dbAgent = await this.agentRepository.rawQuery(
      `SELECT * FROM agents WHERE id = '${agentId}' OR agent_identifier = '${agentId}' LIMIT 1`,
    );

    if (!dbAgent.length) {
      throw new Error('Agent não encontrado');
    }

    const agent = dbAgent[0];

    const latestInstructions =
      await this.agentInstructionRepository.findLatestByAgentId(agent.id);

    const chat = new ChatVertexAI({
      model: agent.model || config.aiModel,
      temperature: agent.temperature ?? 0.4,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    });

    const runnableOpts = { withHistory: !!agent.with_history };

    const tools = await this.loadTools(agent);
    const systemPrompt = await this.buildSystemPromptService.execute(
      latestInstructions?.instructions,
      tools,
      promptVariables,
    );

    return {
      id: agent.id,
      systemPrompt,
      chat,
      tools,
      runnableOpts,
      sites: (agent as any).sites || undefined,
    };
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

    if (dbAgent.database_tool) {
      tools.push(await this.loadDatabaseToolService.execute());
    }

    return tools;
  }
}
