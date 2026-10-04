import { Module } from '@nestjs/common';

import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { ResolveSourceAgentService } from 'src/modules/sources/resolve-source-agent/resolve-source-agent.service';

@Module({
  imports: [AgentRepositoryModule],
  providers: [ResolveSourceAgentService],
  exports: [ResolveSourceAgentService],
})
export class ResolveSourceAgentModule {}
