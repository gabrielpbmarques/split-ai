import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ExecuteSqlToolService } from './execute-sql-tool.service';
import { QueryResultCacheService } from './query-result-cache.service';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  providers: [ExecuteSqlToolService, QueryResultCacheService],
  exports: [ExecuteSqlToolService, QueryResultCacheService],
})
export class ExecuteSqlToolModule {}
