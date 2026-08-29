import { Module } from '@nestjs/common';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { SaveAgentConnectionLayoutController } from './save-agent-connection-layout.controller';
import { SaveAgentConnectionLayoutService } from './save-agent-connection-layout.service';

@Module({
  imports: [AgentRepositoryModule],
  controllers: [SaveAgentConnectionLayoutController],
  providers: [SaveAgentConnectionLayoutService],
  exports: [SaveAgentConnectionLayoutService],
})
export class SaveAgentConnectionLayoutModule {}
