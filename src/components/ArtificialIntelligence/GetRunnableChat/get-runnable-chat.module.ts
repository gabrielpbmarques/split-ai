import { Module } from '@nestjs/common';
import { CreateHistoryModule } from 'src/components/ArtificialIntelligence/CreateHistory/create-history.module';

import { GetRunnableChatService } from './get-runnable-chat.service';

@Module({
  imports: [CreateHistoryModule],
  providers: [GetRunnableChatService],
  exports: [GetRunnableChatService],
})
export class GetRunnableChatModule {}
