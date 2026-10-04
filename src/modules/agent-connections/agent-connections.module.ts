import { Module } from '@nestjs/common';

import { CreateAgentConnectionModule } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.module';
import { DeleteAgentConnectionModule } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.module';
import { ListAgentConnectionsModule } from 'src/modules/agent-connections/list-agent-connections/list-agent-connections.module';
import { SaveAgentConnectionLayoutModule } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.module';
import { UpdateAgentConnectionModule } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.module';

@Module({
  imports: [
    CreateAgentConnectionModule,
    DeleteAgentConnectionModule,
    ListAgentConnectionsModule,
    SaveAgentConnectionLayoutModule,
    UpdateAgentConnectionModule,
  ],
  exports: [
    CreateAgentConnectionModule,
    DeleteAgentConnectionModule,
    ListAgentConnectionsModule,
    SaveAgentConnectionLayoutModule,
    UpdateAgentConnectionModule,
  ],
})
export class AgentConnectionsModule {}
