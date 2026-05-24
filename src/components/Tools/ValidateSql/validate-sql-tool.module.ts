import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ValidateSqlToolService } from './validate-sql-tool.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ValidateSqlToolService],
  exports: [ValidateSqlToolService],
})
export class ValidateSqlToolModule {}
