import { Module } from '@nestjs/common';
import { GenerateAgentSourceService } from './generate-agent-source.service';
import { GenerateAgentSourceController } from './generate-agent-source.controller';
import { PdfModule } from 'src/components/Pdf/pdf.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [PdfModule, InfrastructureModule],
  providers: [GenerateAgentSourceService],
  controllers: [GenerateAgentSourceController],
})
export class GenerateAgentSourceModule {}
