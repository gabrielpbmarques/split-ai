import { Module } from '@nestjs/common';
import { SpiderProviderModule } from 'src/infrastructure/providers/spider.provider.module';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';

import { LoadAgentSitesController } from './load-agent-sites.controller';
import { LoadAgentSitesService } from './load-agent-sites.service';

@Module({
  imports: [SpiderProviderModule, SupabaseProviderModule],
  providers: [LoadAgentSitesService],
  exports: [LoadAgentSitesService],
  controllers: [LoadAgentSitesController],
})
export class LoadAgentSitesModule {}
