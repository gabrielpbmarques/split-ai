import { Module } from '@nestjs/common';

import { LoadAgentSitesController } from 'src/modules/agents/load-agent-sites/load-agent-sites.controller';
import { LoadAgentSitesService } from 'src/modules/agents/load-agent-sites/load-agent-sites.service';

@Module({
  providers: [LoadAgentSitesService],
  exports: [LoadAgentSitesService],
  controllers: [LoadAgentSitesController],
})
export class LoadAgentSitesModule {}
