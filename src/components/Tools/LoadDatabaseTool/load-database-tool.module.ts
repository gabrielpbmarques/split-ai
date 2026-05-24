import { Module } from '@nestjs/common';

import { LoadDatabaseToolService } from './load-database-tool.service';

@Module({
  providers: [LoadDatabaseToolService],
  exports: [LoadDatabaseToolService],
})
export class LoadDatabaseToolModule {}
