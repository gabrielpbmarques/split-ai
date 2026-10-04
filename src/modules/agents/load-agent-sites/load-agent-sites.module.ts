import { Module } from '@nestjs/common';

import { SpiderProviderModule } from 'src/infrastructure/spider/spider.provider.module';
import { SupabaseProviderModule } from 'src/infrastructure/supabase/supabase.provider.module';
import { LoadAgentSitesController } from 'src/modules/agents/load-agent-sites/load-agent-sites.controller';
import { LoadAgentSitesService } from 'src/modules/agents/load-agent-sites/load-agent-sites.service';

@Module({
  imports: [SpiderProviderModule, SupabaseProviderModule],
  providers: [LoadAgentSitesService],
  exports: [LoadAgentSitesService],
  controllers: [LoadAgentSitesController],
})
export class LoadAgentSitesModule {}
