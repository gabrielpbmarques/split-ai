import { Module } from '@nestjs/common';
import { SessionModule } from 'src/components/Session/session.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetReportConversationController } from './get-report-conversation.controller';
import { GetReportConversationService } from './get-report-conversation.service';

@Module({
  imports: [RepositoriesModule, SessionModule],
  controllers: [GetReportConversationController],
  providers: [GetReportConversationService],
  exports: [GetReportConversationService],
})
export class GetReportConversationModule {}
