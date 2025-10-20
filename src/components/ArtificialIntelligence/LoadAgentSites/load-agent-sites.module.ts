import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { LoadAgentSitesService } from './load-agent-sites.service';

@Module({
  imports: [InfrastructureModule],
  providers: [LoadAgentSitesService],
  exports: [LoadAgentSitesService],
})
export class LoadAgentSitesModule {}
