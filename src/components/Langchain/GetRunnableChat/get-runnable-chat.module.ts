import { Module } from '@nestjs/common';
import { GetRunnableChatService } from './get-runnable-chat.service';
import { CreateHistoryModule } from '../CreateHistory/create-history.module';

@Module({
  imports: [CreateHistoryModule],
  providers: [GetRunnableChatService],
  exports: [GetRunnableChatService],
})
export class GetRunnableChatModule {}
