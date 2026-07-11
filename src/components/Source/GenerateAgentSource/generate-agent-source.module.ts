import { Module } from '@nestjs/common';
import { LoadAgentSitesService } from 'src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.service';
import { ProcessDocxSourceModule } from 'src/components/Source/ProcessDocxSource/process-docx-source.module';
import { ProcessPdfSourceModule } from 'src/components/Source/ProcessPdfSource/process-pdf-source.module';
import { ProcessTextSourceModule } from 'src/components/Source/ProcessTextSource/process-text-source.module';
import { ResolveSourceAgentModule } from 'src/components/Source/ResolveSourceAgent/resolve-source-agent.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GenerateAgentSourceController } from './generate-agent-source.controller';
import { GenerateAgentSourceService } from './generate-agent-source.service';

@Module({
  imports: [
    ResolveSourceAgentModule,
    ProcessPdfSourceModule,
    ProcessTextSourceModule,
    ProcessDocxSourceModule,
    InfrastructureModule,
    RepositoriesModule,
  ],
  providers: [GenerateAgentSourceService, LoadAgentSitesService],
  controllers: [GenerateAgentSourceController],
})
export class GenerateAgentSourceModule {}
