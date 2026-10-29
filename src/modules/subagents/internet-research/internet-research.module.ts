import { Module } from '@nestjs/common';

import { InternetResearchService } from 'src/modules/subagents/internet-research/internet-research.service';
import { ToolLoaderModule } from 'src/modules/tools/tool-loader/tool-loader.module';

@Module({
  imports: [ToolLoaderModule],
  providers: [InternetResearchService],
  exports: [InternetResearchService],
})
export class InternetResearchModule {}
