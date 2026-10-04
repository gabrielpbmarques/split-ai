import { Module } from '@nestjs/common';

import { RecordTokenUsageService } from 'src/modules/billing/record-token-usage/record-token-usage.service';
import { TokenUsageRepositoryModule } from 'src/modules/billing/repositories/token-usage.repository.module';

@Module({
  imports: [TokenUsageRepositoryModule],
  providers: [RecordTokenUsageService],
  exports: [RecordTokenUsageService],
})
export class RecordTokenUsageModule {}
