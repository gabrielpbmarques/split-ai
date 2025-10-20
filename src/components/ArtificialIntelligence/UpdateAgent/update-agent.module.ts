import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { LoadAgentSitesModule } from '../LoadAgentSites/load-agent-sites.module';

import { UpdateAgentController } from './update-agent.controller';
import { UpdateAgentService } from './update-agent.service';

@Module({
  imports: [RepositoriesModule, LoadAgentSitesModule],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
