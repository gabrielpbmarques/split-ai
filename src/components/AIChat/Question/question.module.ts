import { Module } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { CompositeAuthGuard } from 'src/auth/composite-auth.guard';
import { RecordChatMessageModule } from 'src/components/AIChat/RecordChatMessage/record-chat-message.module';
import { GenerateAiResponseModule } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.module';
import { ResolveAgentModule } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.module';
import { CreateSessionIfNotExistsModule } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.module';
import { ApiKeyRepositoryModule } from 'src/repositories/api-key.repository.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [
    ApiKeyRepositoryModule,
    CreateSessionIfNotExistsModule,
    GenerateAiResponseModule,
    OrganizationRepositoryModule,
    RecordChatMessageModule,
    ResolveAgentModule,
  ],
  providers: [QuestionService, AuthGuard, ApiKeyGuard, CompositeAuthGuard],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
