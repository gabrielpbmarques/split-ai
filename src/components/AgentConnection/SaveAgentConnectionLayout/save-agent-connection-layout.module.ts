import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { SaveAgentConnectionLayoutController } from './save-agent-connection-layout.controller';
import { SaveAgentConnectionLayoutService } from './save-agent-connection-layout.service';

@Module({
  imports: [AuthModule, AgentRepositoryModule],
  controllers: [SaveAgentConnectionLayoutController],
  providers: [SaveAgentConnectionLayoutService],
  exports: [SaveAgentConnectionLayoutService],
})
export class SaveAgentConnectionLayoutModule {}
