import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity, SessionEntity } from 'src/entities';

import { GetSessionMessagesController } from './get-session-messages.controller';
import { GetSessionMessagesService } from './get-session-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, MessageEntity])],
  controllers: [GetSessionMessagesController],
  providers: [GetSessionMessagesService],
  exports: [GetSessionMessagesService],
})
export class GetSessionMessagesModule {}
