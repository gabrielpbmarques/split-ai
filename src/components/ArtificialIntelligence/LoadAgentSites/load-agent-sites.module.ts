import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { LoadAgentSitesController } from './load-agent-sites.controller';
import { LoadAgentSitesService } from './load-agent-sites.service';

@Module({
  imports: [InfrastructureModule],
  providers: [LoadAgentSitesService],
  exports: [LoadAgentSitesService],
  controllers: [LoadAgentSitesController],
})
export class LoadAgentSitesModule {}
