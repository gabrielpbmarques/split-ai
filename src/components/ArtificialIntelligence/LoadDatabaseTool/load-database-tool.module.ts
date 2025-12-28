import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { LoadDatabaseToolService } from './load-database-tool.service';

@Module({
  imports: [RepositoriesModule],
  providers: [LoadDatabaseToolService],
  exports: [LoadDatabaseToolService],
})
export class LoadDatabaseToolModule {}
