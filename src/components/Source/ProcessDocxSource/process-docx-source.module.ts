import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { ProcessDocxSourceService } from './process-docx-source.service';

@Module({
  imports: [InfrastructureModule],
  providers: [ProcessDocxSourceService],
  exports: [ProcessDocxSourceService],
})
export class ProcessDocxSourceModule {}
