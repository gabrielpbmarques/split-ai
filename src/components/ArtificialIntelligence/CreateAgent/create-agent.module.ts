import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { LoadAgentSitesModule } from '../LoadAgentSites/load-agent-sites.module';

import { CreateAgentController } from './create-agent.controller';
import { CreateAgentService } from './create-agent.service';

@Module({
  imports: [RepositoriesModule, LoadAgentSitesModule],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
