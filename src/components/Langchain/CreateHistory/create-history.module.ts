import { Module } from '@nestjs/common';
import { CreateHistoryService } from './create-history.service';

@Module({
  providers: [CreateHistoryService],
})
export class CreateHistoryModule {}
