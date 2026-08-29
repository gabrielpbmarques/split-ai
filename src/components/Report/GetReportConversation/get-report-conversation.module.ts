import { Module } from '@nestjs/common';
import { GetSessionMessagesModule } from 'src/components/Session/GetSessionMessages/get-session-messages.module';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';

import { GetReportConversationController } from './get-report-conversation.controller';
import { GetReportConversationService } from './get-report-conversation.service';

@Module({
  imports: [GetSessionMessagesModule, ReportRepositoryModule],
  controllers: [GetReportConversationController],
  providers: [GetReportConversationService],
  exports: [GetReportConversationService],
})
export class GetReportConversationModule {}
