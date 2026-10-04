import { Module } from '@nestjs/common';
import { RecordChatMessageModule } from 'src/components/AIChat/RecordChatMessage/record-chat-message.module';
import { GenerateAiResponseModule } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.module';
import { ResolveAgentModule } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.module';
import { CreateSessionIfNotExistsModule } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.module';

import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [
    CreateSessionIfNotExistsModule,
    GenerateAiResponseModule,
    RecordChatMessageModule,
    ResolveAgentModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
