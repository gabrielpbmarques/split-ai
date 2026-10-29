import { Injectable } from '@nestjs/common';
import type { SubAgent } from 'deepagents';

import { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';
import { env } from 'src/shared/config/env';

@Injectable()
export class InternetResearchService {
  constructor(private readonly toolLoaderService: ToolLoaderService) {}

  async execute(): Promise<SubAgent> {
    const agentTools =
      await this.toolLoaderService.execute('internet_research');

    const agent: SubAgent = {
      name: 'internet-research-agent',
      description: 'Used to search the internet for information',
      systemPrompt:
        'You are an expert internet researcher. Search the internet for information and return the results.',
      model: env.AI_MODEL,
      tools: agentTools,
    };

    return agent;
  }
}
