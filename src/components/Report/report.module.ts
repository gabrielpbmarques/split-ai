import { Module } from '@nestjs/common';

import { GetReportModule } from './GetReport/get-report.module';
import { GetReportConversationModule } from './GetReportConversation/get-report-conversation.module';
import { ListReportsModule } from './ListReports/list-reports.module';

@Module({
  imports: [ListReportsModule, GetReportModule, GetReportConversationModule],
})
export class ReportModule {}
