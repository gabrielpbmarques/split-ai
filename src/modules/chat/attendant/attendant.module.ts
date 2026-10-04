import { Module } from '@nestjs/common';

import { GenerateAiResponseModule } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.module';
import { ResolveAgentModule } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.module';
import { AttendantController } from 'src/modules/chat/attendant/attendant.controller';
import { AttendantService } from 'src/modules/chat/attendant/attendant.service';
import { RecordChatMessageModule } from 'src/modules/chat/record-chat-message/record-chat-message.module';
import { CreateSessionIfNotExistsModule } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.module';

@Module({
  imports: [
    CreateSessionIfNotExistsModule,
    GenerateAiResponseModule,
    RecordChatMessageModule,
    ResolveAgentModule,
  ],
  providers: [AttendantService],
  controllers: [AttendantController],
  exports: [AttendantService],
})
export class AttendantModule {}
