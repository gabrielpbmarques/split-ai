import { Module } from '@nestjs/common';

import { AttendantModule } from './Attendant/attendant.module';
import { QuestionModule } from './Question/question.module';

@Module({
  imports: [QuestionModule, AttendantModule],
  exports: [QuestionModule, AttendantModule],
})
export class AIChatModule {}
