import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { RecordTokenUsageService } from './record-token-usage.service';

@Module({
  imports: [RepositoriesModule],
  providers: [RecordTokenUsageService],
  exports: [RecordTokenUsageService],
})
export class RecordTokenUsageModule {}
