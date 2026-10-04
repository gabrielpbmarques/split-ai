import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { SaveAgentConnectionLayoutController } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.controller';
import { SaveAgentConnectionLayoutService } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AuthModule, AgentRepositoryModule],
  controllers: [SaveAgentConnectionLayoutController],
  providers: [SaveAgentConnectionLayoutService],
  exports: [SaveAgentConnectionLayoutService],
})
export class SaveAgentConnectionLayoutModule {}
