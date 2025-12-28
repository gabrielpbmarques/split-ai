import { Module } from '@nestjs/common';
import { RecordChatMessageModule } from 'src/components/AIChat/RecordChatMessage/record-chat-message.module';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';
import { CreditsModule } from 'src/components/Credits/credits.module';
import { SessionModule } from 'src/components/Session/session.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [
    InfrastructureModule,
    RepositoriesModule,
    ArtificialIntelligenceModule,
    SessionModule,
    RecordChatMessageModule,
    CreditsModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
