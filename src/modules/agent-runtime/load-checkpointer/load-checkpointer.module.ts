import { Module } from '@nestjs/common';

import { LoadCheckpointerService } from 'src/modules/agent-runtime/load-checkpointer/load-checkpointer.service';

@Module({
  providers: [LoadCheckpointerService],
  exports: [LoadCheckpointerService],
})
export class LoadCheckpointerModule {}
