import { Module } from '@nestjs/common';
import { RecordChatMessageModule } from 'src/components/AIChat/RecordChatMessage/record-chat-message.module';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';
import { SessionModule } from 'src/components/Session/session.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { AttendantController } from './attendant.controller';
import { AttendantService } from './attendant.service';

@Module({
  imports: [
    RepositoriesModule,
    ArtificialIntelligenceModule,
    SessionModule,
    RecordChatMessageModule,
  ],
  providers: [AttendantService],
  controllers: [AttendantController],
  exports: [AttendantService],
})
export class AttendantModule {}
