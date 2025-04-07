import { Module } from '@nestjs/common';
import { GetRunnableChatService } from './get-runnable-chat.service';
import { CreateHistoryService } from '../CreateHistory/create-history.service';

@Module({
  providers: [GetRunnableChatService, CreateHistoryService],
})
export class GetRunnableChatModule {}
