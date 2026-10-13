import { Module } from '@nestjs/common';

import { ToolLoaderModule } from 'src/modules/tools/tool-loader/tool-loader.module';

@Module({
  imports: [ToolLoaderModule],
  exports: [ToolLoaderModule],
})
export class ToolsModule {}
