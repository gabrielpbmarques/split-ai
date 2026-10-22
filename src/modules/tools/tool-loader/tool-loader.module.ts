import { Module } from '@nestjs/common';

import { TavilySearchModule } from 'src/modules/tools/tavily-search/tavily-search.module';
import { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';
import { VectorSearchToolModule } from 'src/modules/tools/vector-search-tool/vector-search-tool.module';

@Module({
  imports: [VectorSearchToolModule, TavilySearchModule],
  providers: [ToolLoaderService],
  exports: [ToolLoaderService],
})
export class ToolLoaderModule {}
