import { Inject, Injectable } from '@nestjs/common';

import {
  type ITavilySearchService,
  TAVILY_SEARCH_SERVICE,
} from 'src/infrastructure/providers/tavily.provider';
import type { AgentTool } from 'src/shared/contracts';

@Injectable()
export class TavilySearchService {
  constructor(
    @Inject(TAVILY_SEARCH_SERVICE)
    private readonly tavilySearch: ITavilySearchService,
  ) {}

  async execute(): Promise<AgentTool> {
    return this.tavilySearch.createTool();
  }
}
