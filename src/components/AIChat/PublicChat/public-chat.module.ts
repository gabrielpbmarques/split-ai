import { Module } from '@nestjs/common';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';
import { SessionModule } from 'src/components/Session/session.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { PublicChatController } from './public-chat.controller';
import { PublicChatService } from './public-chat.service';

@Module({
  imports: [RepositoriesModule, ArtificialIntelligenceModule, SessionModule],
  controllers: [PublicChatController],
  providers: [PublicChatService],
  exports: [PublicChatService],
})
export class PublicChatModule {}
