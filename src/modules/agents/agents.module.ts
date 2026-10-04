import { Module } from '@nestjs/common';

import { CreateAgentModule } from 'src/modules/agents/create-agent/create-agent.module';
import { CreateAttendantAgentModule } from 'src/modules/agents/create-attendant-agent/create-attendant-agent.module';
import { ListAgentsModule } from 'src/modules/agents/list-agents/list-agents.module';
import { LoadAgentSitesModule } from 'src/modules/agents/load-agent-sites/load-agent-sites.module';
import { UpdateAgentModule } from 'src/modules/agents/update-agent/update-agent.module';

@Module({
  imports: [
    CreateAgentModule,
    CreateAttendantAgentModule,
    ListAgentsModule,
    LoadAgentSitesModule,
    UpdateAgentModule,
  ],
  exports: [
    CreateAgentModule,
    CreateAttendantAgentModule,
    ListAgentsModule,
    LoadAgentSitesModule,
    UpdateAgentModule,
  ],
})
export class AgentsModule {}
