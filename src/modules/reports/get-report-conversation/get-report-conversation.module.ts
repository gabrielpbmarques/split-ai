import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { GetReportConversationController } from 'src/modules/reports/get-report-conversation/get-report-conversation.controller';
import { GetReportConversationService } from 'src/modules/reports/get-report-conversation/get-report-conversation.service';
import { ReportRepositoryModule } from 'src/modules/reports/repositories/report.repository.module';
import { GetSessionMessagesModule } from 'src/modules/sessions/get-session-messages/get-session-messages.module';

@Module({
  imports: [AuthModule, GetSessionMessagesModule, ReportRepositoryModule],
  controllers: [GetReportConversationController],
  providers: [GetReportConversationService],
  exports: [GetReportConversationService],
})
export class GetReportConversationModule {}
