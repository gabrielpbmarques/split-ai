import { Module } from '@nestjs/common';
import { ConversationModule } from 'src/components/Conversation/conversation.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetReportConversationController } from './get-report-conversation.controller';
import { GetReportConversationService } from './get-report-conversation.service';

@Module({
  imports: [RepositoriesModule, ConversationModule],
  controllers: [GetReportConversationController],
  providers: [GetReportConversationService],
  exports: [GetReportConversationService],
})
export class GetReportConversationModule {}
