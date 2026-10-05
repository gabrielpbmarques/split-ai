import { Module } from '@nestjs/common';

import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { LoadDatabaseToolModule } from 'src/modules/retrieval/load-database-tool/load-database-tool.module';
import { MaybeLoadDatabaseToolService } from 'src/modules/retrieval/maybe-load-database-tool/maybe-load-database-tool.service';

@Module({
  imports: [LoadDatabaseToolModule, AgentRepositoryModule],
  providers: [MaybeLoadDatabaseToolService],
  exports: [MaybeLoadDatabaseToolService],
})
export class MaybeLoadDatabaseToolModule {}
