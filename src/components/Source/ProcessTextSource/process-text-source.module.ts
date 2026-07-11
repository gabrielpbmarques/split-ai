import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { ProcessTextSourceService } from './process-text-source.service';

@Module({
  imports: [InfrastructureModule],
  providers: [ProcessTextSourceService],
  exports: [ProcessTextSourceService],
})
export class ProcessTextSourceModule {}
