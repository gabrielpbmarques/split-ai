import { Module } from '@nestjs/common';
import { CreateHistoryService } from 'src/components/Langchain/CreateHistory/create-history.service';

@Module({
  providers: [CreateHistoryService],
  exports: [CreateHistoryService],
})
export class CreateHistoryModule {}
