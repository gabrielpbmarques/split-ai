import { Module } from '@nestjs/common';

import { LoadDatabaseToolService } from 'src/modules/retrieval/load-database-tool/load-database-tool.service';

@Module({
  providers: [LoadDatabaseToolService],
  exports: [LoadDatabaseToolService],
})
export class LoadDatabaseToolModule {}
