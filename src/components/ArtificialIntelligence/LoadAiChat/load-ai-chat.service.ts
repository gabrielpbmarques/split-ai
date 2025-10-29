import { Injectable } from '@nestjs/common';
import {
  AgentMiddleware,
  createAgent,
  ReactAgent,
  ResponseFormatUndefined,
} from 'langchain';
import { DynamicStructuredTool } from 'langchain';
import { BuildSystemPromptService } from 'src/components/ArtificialIntelligence/BuildSystemPrompt/build-system-prompt.service';
import { LoadCheckpointerService } from 'src/components/ArtificialIntelligence/LoadCheckpointer/load-checkpointer.service';
import { LoadDatabaseToolService } from 'src/components/ArtificialIntelligence/LoadDatabaseTool/load-database-tool.service';
import { ResolvedAgent } from 'src/types';
import { AISourceType, CustomMetadata } from 'src/types';
import z from 'zod';

@Injectable()
export class LoadAiChatService {
  constructor(
    private readonly loadCheckpointerService: LoadCheckpointerService,
    private readonly buildSystemPromptService: BuildSystemPromptService,
    private readonly loadDatabaseToolService: LoadDatabaseToolService,
  ) {}

  async execute(
    agent: ResolvedAgent,
    metadata: CustomMetadata,
    question: string,
    databaseTool: boolean = false,
    sources?: AISourceType[],
  ): Promise<
    ReactAgent<
      ResponseFormatUndefined,
      undefined,
      any,
      readonly AgentMiddleware<any, any, any>[]
    >
  > {
    const { chat, jsonParser, runnableOpts, instructions } = agent;

    const tools: DynamicStructuredTool<z.ZodObject<{ query: z.ZodString }>>[] =
      [];

    let dbTool: DynamicStructuredTool<z.ZodObject<{ query: z.ZodString }>>;

    const systemPrompt = await this.buildSystemPromptService.execute(
      instructions,
      metadata,
      question,
      sources,
    );

    if (databaseTool) {
      dbTool = await this.loadDatabaseToolService.execute();
      tools.push(dbTool);
    }

    if (jsonParser) {
      tools.push(jsonParser);
    }

    if (runnableOpts.withHistory) {
      const checkpointer = this.loadCheckpointerService.execute();

      return createAgent({
        model: chat as any,
        tools,
        systemPrompt,
        checkpointer,
      });
    }

    return createAgent({
      model: chat as any,
      tools,
      systemPrompt,
    });
  }
}
