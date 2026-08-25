import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { LoadDatabaseToolModule } from '../LoadDatabaseTool/load-database-tool.module';

import { MaybeLoadDatabaseToolService } from './maybe-load-database-tool.service';

@Module({
  imports: [RepositoriesModule, LoadDatabaseToolModule],
  providers: [MaybeLoadDatabaseToolService],
  exports: [MaybeLoadDatabaseToolService],
})
export class MaybeLoadDatabaseToolModule {}
