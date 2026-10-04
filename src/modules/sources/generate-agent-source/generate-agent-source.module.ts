import { Module } from '@nestjs/common';

import { LoadAgentSitesService } from 'src/modules/agents/load-agent-sites/load-agent-sites.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { GenerateAgentSourceController } from 'src/modules/sources/generate-agent-source/generate-agent-source.controller';
import { GenerateAgentSourceService } from 'src/modules/sources/generate-agent-source/generate-agent-source.service';
import { ProcessDocxSourceModule } from 'src/modules/sources/process-docx-source/process-docx-source.module';
import { ProcessPdfSourceModule } from 'src/modules/sources/process-pdf-source/process-pdf-source.module';
import { ProcessTextSourceModule } from 'src/modules/sources/process-text-source/process-text-source.module';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';
import { ResolveSourceAgentModule } from 'src/modules/sources/resolve-source-agent/resolve-source-agent.module';

@Module({
  imports: [
    AgentRepositoryModule,
    ProcessDocxSourceModule,
    ProcessPdfSourceModule,
    ProcessTextSourceModule,
    ResolveSourceAgentModule,
    SourceRepositoryModule,
  ],
  providers: [GenerateAgentSourceService, LoadAgentSitesService],
  controllers: [GenerateAgentSourceController],
})
export class GenerateAgentSourceModule {}
