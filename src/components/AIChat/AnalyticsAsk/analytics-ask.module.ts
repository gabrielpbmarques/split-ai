import { Module } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { ResolveAgentModule } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.module';
import { TokenUsageModule } from 'src/components/TokenUsage/token-usage.module';

import { AnalyticsAskController } from './analytics-ask.controller';
import { AnalyticsAskService } from './analytics-ask.service';

@Module({
  imports: [ResolveAgentModule, TokenUsageModule],
  controllers: [AnalyticsAskController],
  providers: [AnalyticsAskService, ApiKeyGuard],
  exports: [AnalyticsAskService],
})
export class AnalyticsAskModule {}
