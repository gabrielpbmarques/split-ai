import { Module } from '@nestjs/common';

import { CreateAgentModule } from 'src/modules/agents/create-agent/create-agent.module';
import { CreateAttendantAgentModule } from 'src/modules/agents/create-attendant-agent/create-attendant-agent.module';
import { GetAgentModule } from 'src/modules/agents/get-agent/get-agent.module';
import { ListAgentsModule } from 'src/modules/agents/list-agents/list-agents.module';
import { ListAllAgentsModule } from 'src/modules/agents/list-all-agents/list-all-agents.module';
import { LoadAgentSitesModule } from 'src/modules/agents/load-agent-sites/load-agent-sites.module';
import { UpdateAgentModule } from 'src/modules/agents/update-agent/update-agent.module';

@Module({
  imports: [
    CreateAgentModule,
    CreateAttendantAgentModule,
    GetAgentModule,
    ListAgentsModule,
    ListAllAgentsModule,
    LoadAgentSitesModule,
    UpdateAgentModule,
  ],
  exports: [
    CreateAgentModule,
    CreateAttendantAgentModule,
    GetAgentModule,
    ListAgentsModule,
    ListAllAgentsModule,
    LoadAgentSitesModule,
    UpdateAgentModule,
  ],
})
export class AgentsModule {}
