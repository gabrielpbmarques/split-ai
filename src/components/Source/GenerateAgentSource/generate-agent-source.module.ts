import { Module } from '@nestjs/common';
import { LoadAgentSitesService } from 'src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.service';
import { ProcessDocxSourceModule } from 'src/components/Source/ProcessDocxSource/process-docx-source.module';
import { ProcessPdfSourceModule } from 'src/components/Source/ProcessPdfSource/process-pdf-source.module';
import { ProcessTextSourceModule } from 'src/components/Source/ProcessTextSource/process-text-source.module';
import { ResolveSourceAgentModule } from 'src/components/Source/ResolveSourceAgent/resolve-source-agent.module';
import { SpiderProviderModule } from 'src/infrastructure/providers/spider.provider.module';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';
import { SourceRepositoryModule } from 'src/repositories/source.repository.module';

import { GenerateAgentSourceController } from './generate-agent-source.controller';
import { GenerateAgentSourceService } from './generate-agent-source.service';

@Module({
  imports: [
    AgentRepositoryModule,
    ProcessDocxSourceModule,
    ProcessPdfSourceModule,
    ProcessTextSourceModule,
    ResolveSourceAgentModule,
    SourceRepositoryModule,
    SpiderProviderModule,
    SupabaseProviderModule,
  ],
  providers: [GenerateAgentSourceService, LoadAgentSitesService],
  controllers: [GenerateAgentSourceController],
})
export class GenerateAgentSourceModule {}
