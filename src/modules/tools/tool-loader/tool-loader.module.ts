import { Module } from '@nestjs/common';

import { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';
import { VectorSearchToolModule } from 'src/modules/tools/vector-search-tool/vector-search-tool.module';

@Module({
  imports: [VectorSearchToolModule],
  providers: [ToolLoaderService],
  exports: [ToolLoaderService],
})
export class ToolLoaderModule {}
