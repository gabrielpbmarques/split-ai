import { Module } from '@nestjs/common';
import { QuestionModule } from './Question/question.module';

@Module({
  imports: [QuestionModule],
  exports: [QuestionModule],
})
export class AIChatModule {}
