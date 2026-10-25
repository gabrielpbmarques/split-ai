import { Module } from '@nestjs/common';

import { TavilySearchModule } from 'src/modules/tools/tavily-search/tavily-search.module';
import { ToolLoaderModule } from 'src/modules/tools/tool-loader/tool-loader.module';
import { VectorSearchToolModule } from 'src/modules/tools/vector-search-tool/vector-search-tool.module';

@Module({
  imports: [ToolLoaderModule, VectorSearchToolModule, TavilySearchModule],
  exports: [ToolLoaderModule, VectorSearchToolModule, TavilySearchModule],
})
export class ToolsModule {}
