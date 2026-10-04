import { Module } from '@nestjs/common';

import { ProcessTextSourceService } from 'src/modules/sources/process-text-source/process-text-source.service';

@Module({
  providers: [ProcessTextSourceService],
  exports: [ProcessTextSourceService],
})
export class ProcessTextSourceModule {}
