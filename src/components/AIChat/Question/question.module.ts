import { Module } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { CompositeAuthGuard } from 'src/auth/composite-auth.guard';
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
  providers: [
    QuestionService,
    // Auth guards used by `CompositeAuthGuard` — register here so Nest can
    // resolve their dependencies (e.g. `Reflector` for `AuthGuard`).
    AuthGuard,
    ApiKeyGuard,
    CompositeAuthGuard,
  ],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
