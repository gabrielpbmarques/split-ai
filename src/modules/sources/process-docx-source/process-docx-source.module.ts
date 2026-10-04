import { Module } from '@nestjs/common';

import { ProcessDocxSourceService } from 'src/modules/sources/process-docx-source/process-docx-source.service';

@Module({
  providers: [ProcessDocxSourceService],
  exports: [ProcessDocxSourceService],
})
export class ProcessDocxSourceModule {}
