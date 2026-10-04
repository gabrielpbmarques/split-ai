import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GetSessionMessagesModule } from 'src/components/Session/GetSessionMessages/get-session-messages.module';
import { ReportRepositoryModule } from 'src/repositories/report.repository.module';

import { GetReportConversationController } from './get-report-conversation.controller';
import { GetReportConversationService } from './get-report-conversation.service';

@Module({
  imports: [AuthModule, GetSessionMessagesModule, ReportRepositoryModule],
  controllers: [GetReportConversationController],
  providers: [GetReportConversationService],
  exports: [GetReportConversationService],
})
export class GetReportConversationModule {}
