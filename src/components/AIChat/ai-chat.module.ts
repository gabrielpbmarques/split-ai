import { Module } from '@nestjs/common';

import { AnalyticsAskModule } from './AnalyticsAsk/analytics-ask.module';
import { AttendantModule } from './Attendant/attendant.module';
import { QuestionModule } from './Question/question.module';

@Module({
  imports: [QuestionModule, AttendantModule, AnalyticsAskModule],
  exports: [QuestionModule, AttendantModule, AnalyticsAskModule],
})
export class AIChatModule {}
