import { Module } from '@nestjs/common';
import { FindOrCreateSessionModule } from './FindOrCreateSession/find-or-create-session.module';
import { UpdateLastAiResponseModule } from './UpdateLastAiResponse/update-last-ai-response.module';

@Module({
  imports: [FindOrCreateSessionModule, UpdateLastAiResponseModule],
  exports: [FindOrCreateSessionModule, UpdateLastAiResponseModule],
})
export class SessionManagementModule {}
