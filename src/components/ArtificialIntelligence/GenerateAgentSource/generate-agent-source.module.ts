import { Module } from '@nestjs/common';
import { PdfModule } from 'src/components/Pdf/pdf.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { GenerateAgentSourceController } from './generate-agent-source.controller';
import { GenerateAgentSourceService } from './generate-agent-source.service';

@Module({
  imports: [PdfModule, InfrastructureModule],
  providers: [GenerateAgentSourceService],
  controllers: [GenerateAgentSourceController],
})
export class GenerateAgentSourceModule {}
