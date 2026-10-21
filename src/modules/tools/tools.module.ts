import { Module } from '@nestjs/common';

import { TavilySearchModule } from 'src/modules/tools/tavily-search/tavily-search.module';
import { ToolLoaderModule } from 'src/modules/tools/tool-loader/tool-loader.module';

@Module({
  imports: [ToolLoaderModule, TavilySearchModule],
  exports: [ToolLoaderModule, TavilySearchModule],
})
export class ToolsModule {}
