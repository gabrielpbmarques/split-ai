import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ResolveSourceAgentService } from './resolve-source-agent.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ResolveSourceAgentService],
  exports: [ResolveSourceAgentService],
})
export class ResolveSourceAgentModule {}
