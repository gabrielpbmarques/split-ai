import { Module } from '@nestjs/common';

import { GetTokenUsageModule } from './GetTokenUsage/get-token-usage.module';
import { RecordTokenUsageModule } from './RecordTokenUsage/record-token-usage.module';

@Module({
  imports: [GetTokenUsageModule, RecordTokenUsageModule],
  exports: [RecordTokenUsageModule, GetTokenUsageModule],
})
export class TokenUsageModule {}
