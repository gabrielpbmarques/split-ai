import { Module } from '@nestjs/common';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { ResolveSourceAgentService } from './resolve-source-agent.service';

@Module({
  imports: [AgentRepositoryModule],
  providers: [ResolveSourceAgentService],
  exports: [ResolveSourceAgentService],
})
export class ResolveSourceAgentModule {}
