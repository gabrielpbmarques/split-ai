import { Module } from '@nestjs/common';

import { CreateHistoryService } from './create-history.service';

@Module({
  providers: [CreateHistoryService],
  exports: [CreateHistoryService],
})
export class CreateHistoryModule {}
