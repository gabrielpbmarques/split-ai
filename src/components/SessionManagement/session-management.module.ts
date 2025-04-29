import { Module } from '@nestjs/common';
import { FindOrCreateSessionModule } from 'src/components/SessionManagement/FindOrCreateSession/find-or-create-session.module';
import { UpdateLastAiResponseModule } from 'src/components/SessionManagement/UpdateLastAiResponse/update-last-ai-response.module';

@Module({
  imports: [FindOrCreateSessionModule, UpdateLastAiResponseModule],
  exports: [FindOrCreateSessionModule, UpdateLastAiResponseModule],
})
export class SessionManagementModule {}
