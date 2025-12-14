import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity, SessionEntity } from 'src/entities';

import { ListSessionsController } from './list-sessions.controller';
import { ListSessionsService } from './list-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, MessageEntity])],
  controllers: [ListSessionsController],
  providers: [ListSessionsService],
  exports: [ListSessionsService],
})
export class ListSessionsModule {}
