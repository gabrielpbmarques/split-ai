import { Module } from '@nestjs/common';

import { InternetResearchService } from 'src/modules/subagents/internet-research/internet-research.service';

@Module({
  providers: [InternetResearchService],
  exports: [InternetResearchService],
})
export class InternetResearchModule {}
