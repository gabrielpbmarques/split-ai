import { Module } from '@nestjs/common';

import { LoadCheckpointerService } from './load-checkpointer.service';

@Module({
  providers: [LoadCheckpointerService],
  exports: [LoadCheckpointerService],
})
export class LoadCheckpointerModule {}
