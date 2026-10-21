import { Module } from '@nestjs/common';

import { TavilySearchService } from 'src/modules/tools/tavily-search/tavily-search.service';

@Module({
  providers: [TavilySearchService],
  exports: [TavilySearchService],
})
export class TavilySearchModule {}
