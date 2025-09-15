import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRepository } from './session.repository';
import { SessionEntity } from 'src/entities/session.entity';
import { MessageEntity } from 'src/entities/message.entity';
import { MessageRepository } from './message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, MessageEntity])],
  providers: [SessionRepository, MessageRepository],
  exports: [SessionRepository, MessageRepository],
})
export class SupabaseRepositoriesModule {}
