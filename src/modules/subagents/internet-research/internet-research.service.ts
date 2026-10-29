import { Injectable } from '@nestjs/common';
import type { SubAgent } from 'deepagents';

import { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';
import { env } from 'src/shared/config/env';

const INTERNET_RESEARCH_PROMPT =
  'Você é um pesquisador especialista na internet. Realize buscas aprofundadas na web para encontrar informações precisas, relevantes e atualizadas, analisando criticamente as fontes e retornando os resultados consolidados.';

@Injectable()
export class InternetResearchService {
  constructor(private readonly toolLoaderService: ToolLoaderService) {}

  async execute(): Promise<SubAgent> {
    const agentTools =
      await this.toolLoaderService.execute('internet_research');

    const agent: SubAgent = {
      name: 'internet-research-agent',
      description:
        'Utilizado para pesquisar informações atualizadas na internet e sintetizar dados da web',
      systemPrompt: INTERNET_RESEARCH_PROMPT,
      model: env.AI_MODEL,
      tools: agentTools,
    };

    return agent;
  }
}
