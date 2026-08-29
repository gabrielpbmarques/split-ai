import { Module } from '@nestjs/common';
import { TokenUsageRepositoryModule } from 'src/repositories/token-usage.repository.module';

import { RecordTokenUsageService } from './record-token-usage.service';

@Module({
  imports: [TokenUsageRepositoryModule],
  providers: [RecordTokenUsageService],
  exports: [RecordTokenUsageService],
})
export class RecordTokenUsageModule {}
