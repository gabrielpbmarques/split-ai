import { Module } from '@nestjs/common';

import { CreateAgentConnectionModule } from './CreateAgentConnection/create-agent-connection.module';
import { DeleteAgentConnectionModule } from './DeleteAgentConnection/delete-agent-connection.module';
import { ListAgentConnectionsModule } from './ListAgentConnections/list-agent-connections.module';
import { SaveAgentConnectionLayoutModule } from './SaveAgentConnectionLayout/save-agent-connection-layout.module';
import { UpdateAgentConnectionModule } from './UpdateAgentConnection/update-agent-connection.module';

@Module({
  imports: [
    CreateAgentConnectionModule,
    ListAgentConnectionsModule,
    UpdateAgentConnectionModule,
    DeleteAgentConnectionModule,
    SaveAgentConnectionLayoutModule,
  ],
  exports: [
    CreateAgentConnectionModule,
    ListAgentConnectionsModule,
    UpdateAgentConnectionModule,
    DeleteAgentConnectionModule,
    SaveAgentConnectionLayoutModule,
  ],
})
export class AgentConnectionModule {}
