import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetSessionMessagesController } from './get-session-messages.controller';
import { GetSessionMessagesService } from './get-session-messages.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [GetSessionMessagesController],
  providers: [GetSessionMessagesService],
  exports: [GetSessionMessagesService],
})
export class GetSessionMessagesModule {}
