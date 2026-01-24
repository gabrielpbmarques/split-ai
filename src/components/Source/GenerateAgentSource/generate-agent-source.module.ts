import { Module } from '@nestjs/common';
import { LoadAgentSitesService } from 'src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.service';
import { PdfModule } from 'src/components/Pdf/pdf.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GenerateAgentSourceController } from './generate-agent-source.controller';
import { GenerateAgentSourceService } from './generate-agent-source.service';

@Module({
  imports: [PdfModule, InfrastructureModule, RepositoriesModule],
  providers: [GenerateAgentSourceService, LoadAgentSitesService],
  controllers: [GenerateAgentSourceController],
})
export class GenerateAgentSourceModule {}
