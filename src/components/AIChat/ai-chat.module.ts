import { Module } from '@nestjs/common';

import { AttendantModule } from './Attendant/attendant.module';
import { PublicChatModule } from './PublicChat/public-chat.module';
import { QuestionModule } from './Question/question.module';

@Module({
  imports: [QuestionModule, AttendantModule, PublicChatModule],
  exports: [QuestionModule, AttendantModule, PublicChatModule],
})
export class AIChatModule {}
