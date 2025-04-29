import { Module } from '@nestjs/common';
import { GetRunnableChatService } from 'src/components/Langchain/GetRunnableChat/get-runnable-chat.service';
import { CreateHistoryModule } from 'src/components/Langchain/CreateHistory/create-history.module';

@Module({
  imports: [CreateHistoryModule],
  providers: [GetRunnableChatService],
  exports: [GetRunnableChatService],
})
export class GetRunnableChatModule {}
