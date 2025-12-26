import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { TokenUsageModule } from '../../TokenUsage/token-usage.module';

import { GenerateAiResponseService } from './generate-ai-response.service';

@Module({
  imports: [RepositoriesModule, TokenUsageModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
